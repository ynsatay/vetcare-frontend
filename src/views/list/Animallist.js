
import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardBody, CardTitle } from "reactstrap";
import { DataGrid } from '@mui/x-data-grid';
import axiosInstance from '../../api/axiosInstance.ts';

const Animalslist = () => {
  const [animalslist, setAnimalslist] = useState([]);

  const fetchAnimalsList = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/animalslist', { params: { user_id: null } });
      setAnimalslist(response.data.response);
    } catch (error) {
      console.error(error);
    }
  }, []);

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

  const columns = [
    { field: 'user_name', headerName: 'Kullanıcı Adı', flex: 1, minWidth: 130 },
    { field: 'animal_name', headerName: 'Hayvan Türü', flex: 1, minWidth: 130 },
    { field: 'species_name', headerName: 'Hayvan Cinsi', flex: 1, minWidth: 130 },
    { field: 'animalname', headerName: 'Hayvan Adı', flex: 1, minWidth: 130 },
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
  ];

  return (
    <div>
      <Card>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <CardTitle tag="h5">🐾 Hayvan Listesi</CardTitle>
            </div>
          </div>

          <div style={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={animalslist}
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

export default Animalslist;
