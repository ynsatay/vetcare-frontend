
import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardBody, CardTitle } from "reactstrap";
import { DataGrid } from '@mui/x-data-grid';
import axiosInstance from '../../api/axiosInstance.ts';
import { useNavigate } from 'react-router-dom';
import { trTR } from '@mui/x-data-grid/locales';

const Animalslist = () => {
  const [animalslist, setAnimalslist] = useState([]);
  const [searchIdentity, setSearchIdentity] = useState('');

  const navigate = useNavigate();

  const fetchAnimalsList = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/animalslist', { params: { user_id: null } });
      setAnimalslist(response.data.response);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const filteredAnimals = animalslist.filter(animal =>
    animal.animalidentnumber?.toString().includes(searchIdentity)
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchAnimalsList();
      } catch (error) {
        console.error(error);
      }
    };
    loadData();
  }, [fetchAnimalsList]);

  const goToIdentity = (row) => {
    navigate(`/IdentityInfo/${row.user_id || row.id}`, {
      state: {
        userId: row.user_id || row.id,
        identity: row.animalidentnumber || '',
        animalId: row.id || null
      }
    });
  };

  const columns = [
    { field: 'user_name', headerName: 'Müşteri Adı', flex: 1, minWidth: 130 },
    { field: 'animalname', headerName: 'Hayvan Adı', flex: 1, minWidth: 130 },
    { field: 'animal_name', headerName: 'Hayvan Türü', flex: 1, minWidth: 130 },
    { field: 'species_name', headerName: 'Hayvan Cinsi', flex: 1, minWidth: 130 },
    {
      field: 'active',
      headerName: 'Aktif',
      width: 70,
      renderCell: (params) => (
        <span className={`p-2 rounded-circle d-inline-block ${params.value ? "bg-success" : "bg-secondary"}`} />
      )
    },
    {
      field: 'isdeath',
      headerName: 'Ölümü',
      width: 70,
      renderCell: (params) => (
        <span className={`p-2 rounded-circle d-inline-block ${params.value ? "bg-danger" : "bg-secondary"}`} />
      )
    },
    { field: 'birthdate', headerName: 'Doğum Tarihi', flex: 1, minWidth: 120 },
    { field: 'deathdate', headerName: 'Ölüm Tarihi', flex: 1, minWidth: 120 },
    { field: 'animalidentnumber', headerName: 'Kimlik No', flex: 1, minWidth: 140 },
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
            <CardTitle tag="h5">🐾 Hayvan Listesi</CardTitle>
            <input
              type="text"
              placeholder="Kimlik No ile Ara..."
              value={searchIdentity}
              onChange={(e) => setSearchIdentity(e.target.value)}
              className="form-control"
              style={{ maxWidth: 250 }}
            />
          </div>

          <div style={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredAnimals}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[5, 10, 20]}
              disableSelectionOnClick
              getRowId={(row) => row.id}
              localeText={{
                ...trTR.components.MuiDataGrid.defaultProps.localeText,
                footerRowSelected: (count) =>
                  count > 1
                    ? `${count.toLocaleString()} satır seçildi`
                    : `${count.toLocaleString()} satır seçildi`,
              }}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Animalslist;
