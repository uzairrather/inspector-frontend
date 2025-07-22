import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '@/constants/config';
import { Button } from '@/components/ui/button';

export default function CompanySelection() {
  const [ownCompany, setOwnCompany] = useState(null);
  const [assignedCompanies, setAssignedCompanies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Unauthorized');
      navigate('/login');
      return;
    }

    const fetchCompanies = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/companies/for-user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        console.log('Response:', data);

        if (res.ok) {
          setOwnCompany(data.ownCompany);
          setAssignedCompanies(data.assignedCompanies || []);
        } else {
          toast.error(data.message || 'Failed to fetch companies');
        }
      } catch (err) {
        toast.error('Server error');
        console.error(err);
      }
    };

    fetchCompanies();
  }, [navigate]);

  const handleSelect = (companyId) => {
    console.log('👀 handleSelect triggered with companyId:', companyId);
    localStorage.setItem('selectedCompanyId', companyId);
    localStorage.setItem('companyId', companyId); 
    console.log('Company selected and saved:', companyId);
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white shadow-lg p-6 rounded-xl space-y-6">
        <h1 className="text-2xl font-bold text-center">Select a Company</h1>

        {assignedCompanies.length > 0 ? (
          <>
            <div className="space-y-2">
              <h2 className="font-semibold text-lg">Assigned Companies</h2>
              {assignedCompanies.map((comp) => (
                <Button
                  key={comp._id}
                  onClick={() => handleSelect(comp._id)}
                  variant="outline"
                  className="w-full"
                >
                  {comp.name}
                </Button>
              ))}
            </div>

            {ownCompany && (
              <div className="space-y-2">
                <h2 className="font-semibold text-lg">Your Company</h2>
                <Button onClick={() => handleSelect(ownCompany.id)} className="w-full">
                  {ownCompany.name}
                </Button>
              </div>
            )}
          </>
        ) : ownCompany ? (
          <div className="space-y-2">
            <h2 className="font-semibold text-lg">Your Company</h2>
            <Button onClick={() => handleSelect(ownCompany.id)} className="w-full">
              {ownCompany.name}
            </Button>
          </div>
        ) : (
          <p className="text-center text-gray-500">No companies found.</p>
        )}
      </div>
    </div>
  );
}
