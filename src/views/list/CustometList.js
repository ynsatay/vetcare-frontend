import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardBody, CardTitle } from "reactstrap";
import { DataGrid } from '@mui/x-data-grid';
import axiosInstance from '../../api/axiosInstance.ts';
import { useNavigate } from 'react-router-dom';

const CustomerList = () => {
  const [customerList, setCustomerList] = useState([]);
  const [searchIdentity, setSearchIdentity] = useState('');
  const navigate = useNavigate();

  const fetchCustomerList = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/customerslist');
      setCustomerList(response.data.response); // API yanıtına göre bu alanı uyarlayabilirsin
    } catch (error) {
      console.error(error);
    }
  }, []);

  const filteredCustomers = customerList.filter(customer =>
    customer.identity?.toString().includes(searchIdentity)
  );

  useEffect(() => {
    fetchCustomerList();
  }, [fetchCustomerList]);

  // 👇 Kimlik sayfasına yönlendirme
  const goToIdentity = (row) => {
    navigate(`/IdentityInfo/${row.id}`, {
      state: {
        userId: row.id,
        identity: row.identity || '',  // TC kimlik ya da başka bir tanımlayıcı varsa
        animalId: null
      }
    });
  };

  // 👇 Kolonlar
  const columns = [
    { field: 'name', headerName: 'Ad', flex: 1, minWidth: 130 },
    { field: 'surname', headerName: 'Soyad', flex: 1, minWidth: 130 },
    { field: 'phone', headerName: 'Telefon', flex: 1, minWidth: 130 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 160 },
    { field: 'address', headerName: 'Adres', flex: 1, minWidth: 180 },
    {
      field: 'actions',
      headerName: 'İşlem',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <button
          className="btn btn-sm btn-primary"
          onClick={() => goToIdentity(params.row)}
        >
          Kimlik
        </button>
      )
    }
  ];

  return (
    <div>
      <Card>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <CardTitle tag="h5">👤 Müşteri Listesi</CardTitle>
            <input
              type="text"
              placeholder="TC No ile Ara..."
              value={searchIdentity}
              onChange={(e) => setSearchIdentity(e.target.value)}
              className="form-control"
              style={{ maxWidth: 250 }}
            />
          </div>

          <div style={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredCustomers}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[5, 10, 20]}
              disableSelectionOnClick
              getRowId={(row) => row.id}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default CustomerList;
