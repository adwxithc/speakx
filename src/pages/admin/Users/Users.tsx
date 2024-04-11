import { Avatar, Box, Typography } from '@mui/material'
import {DataGrid, GridCellParams,gridClasses } from '@mui/x-data-grid'
import { useEffect, useMemo, useState } from 'react'
import {  useGetUsersMutation } from '../../../redux/features/admin/auth/adminApiSlice'
import { setUserPaginationData, setUsersList } from '../../../redux/features/admin/listUsers/usersListSlice'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../redux/store'
import moment from 'moment'
import { grey } from '@mui/material/colors'
import UsersActions from './UsersActions'


function Users() {

  const [rowId, setRowId] = useState<string | null>(null)

 const [getUsersList]= useGetUsersMutation()
 const dispatch =useDispatch()
 const {usersList,totalUsers} = useSelector((state:RootState)=>state.usersList)

 

 

  useEffect(()=>{
    const getUsers=async()=>{
      try {
          const res =await getUsersList({}).unwrap()
          const{users,totalUsers}=res.data
          dispatch(setUsersList([...users]));
          dispatch(setUserPaginationData({...{totalUsers}}))
          console.log(res);
          
          
      } catch (error) {
        console.log(error);
        
      }
    }
    getUsers()
  },[]);

  const handlePageChange =async(newPage: number)=>{
    try {
          const res =await getUsersList({page:newPage,limit:3}).unwrap()
          const{users,page,limit,totalUsers}=res.data
          dispatch(setUsersList([...users]));
          dispatch(setUserPaginationData({...{page,limit,totalUsers}}))
          console.log(res);
      
    } catch (error) {
      console.log(error);
    }
  }



  const columns = useMemo(()=>[
    {field:'profile', headerName:'Avatar',width:60, renderCell:(params:GridCellParams)=><Avatar src={params.row.profile} />, sortable:false,filterable:false, },
    {field:'firstName', headerName:'First Name',width:170},
    {field:'lastName', headerName:'Last Name',width:160},
    {field:'email', headerName:'Email',width:250},
    {field:'userName', headerName:'User Name',width:190},
    {field:'blocked', headerName:'Blocked',width:190,type:'boolean',editable:true},
    {field:'createdAt', headerName:'Created At',width:180, renderCell:(params:GridCellParams)=>moment(params.row.createdAt).format('YYYY-MM-DD HH:MM:SS')},
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      renderCell: (params: GridCellParams) => (
        <UsersActions {...{ params, rowId, setRowId }} />
      )
    }
    
  ],[rowId])
  return (
    <Box
    sx={{
      height:400,
      width:'100%'
    }}
    >
      <Typography
      variant='h3'
      component='h3'
      sx={{textAlign:'center', mt:3,mb:3}}
      >
        Manage Users
      </Typography>

      <DataGrid
  
      columns={columns}
      rows={usersList}
      paginationMode="server"
      paginationModel={{page:2,pageSize:2}}
      rowCount={totalUsers} // Retrieve from server
      onPageChange={handlePageChange}
      getRowId={row=>row.id}
     
      
      getRowSpacing={params=>({
        top:params.isFirstVisible ? 0:5,
        bottom:params.isLastVisible?0:5
      })}
      sx={{
        [`& .${gridClasses.row}`]: {
          bgcolor: (theme) =>
            theme.palette.mode === "light" ? grey[200] : grey[900],
        },
      }}
        onCellEditStop={(params) => setRowId(params.id.toString())}
        onCellEditStart={(params) => setRowId(params.id.toString())}
        
       />

    </Box>
  )
}

export default Users
