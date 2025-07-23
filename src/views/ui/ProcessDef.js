import { Grid } from '@mui/material'
import React from 'react'
import StockList from '../list/StockList'
import ServiceList from '../list/ServiceList'


function ProcessDef() {
    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6} bgcolor="white" height={750} padding={2}>
                    <StockList />
                </Grid>

                <Grid item xs={12} md={6} bgcolor="white" height={750} padding={2}>
                    <ServiceList />
                </Grid>
            </Grid>


        </>
    )
}

export default ProcessDef