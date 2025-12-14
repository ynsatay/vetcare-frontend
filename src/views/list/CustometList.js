import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardBody, CardTitle } from "reactstrap";
import { DataGrid } from '@mui/x-data-grid';
import axiosInstance from '../../api/axiosInstance.ts';
import { useNavigate } from 'react-router-dom';
import { trTR } from '@mui/x-data-grid/locales';
import { useLanguage } from '../../context/LanguageContext.js';
import './ListTheme.css';

const CustomerList = () => {
  const [customerList, setCustomerList] = useState([]);
  const [searchIdentity, setSearchIdentity] = useState('');
  const navigate = useNavigate();
  const { t, lang } = useLanguage();

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
    { field: 'name', headerName: t('Name'), flex: 1, minWidth: 130 },
    { field: 'surname', headerName: t('Surname'), flex: 1, minWidth: 130 },
    { field: 'phone', headerName: t('Phone'), flex: 1, minWidth: 130 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 160 },
    { field: 'address', headerName: t('Address'), flex: 1, minWidth: 180 },
    {
      field: 'actions',
      headerName: t('Actions'),
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <button
          className="btn btn-sm btn-primary"
          onClick={() => goToIdentity(params.row)}
        >
          {t('Identity')}
        </button>
      )
    }
  ];

  return (
    <div className="list-page">
      <Card>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <CardTitle tag="h5">👤 {t('CustomerList')}</CardTitle>
            <input
              type="text"
              placeholder={t('SearchByID')}
              value={searchIdentity}
              onChange={(e) => setSearchIdentity(e.target.value)}
              className="form-control"
              style={{ maxWidth: 250 }}
            />
          </div>

          <div className="list-data-grid" style={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredCustomers}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[5, 10, 20]}
              disableSelectionOnClick
              getRowId={(row) => row.id}
              localeText={{
                ...trTR.components.MuiDataGrid.defaultProps.localeText,
                footerRowSelected: (count) =>
                  lang === 'en'
                    ? `${count.toLocaleString()} row selected`
                    : `${count.toLocaleString()} satır seçildi`,
              }}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default CustomerList;
