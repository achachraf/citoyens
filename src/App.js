import './App.css';
import {useEffect, useState} from 'react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css";
import ClipLoader from "react-spinners/ClipLoader"

const App = () => {
  
  const initFormData = {
    nom:"",
    prenom:"",
    adresse: "",
    codepostal: "",
    localite: "",
    nationalite: "",
    pays: ""
  }
  const [citoyens, setCitoyens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFrom, setShowFrom] = useState(false);
  const [date, setDate] = useState(new Date());
  const [selectedCitoyen, setSelectedCitoyen] = useState(initFormData);
  const [selectedCitoyenDate,setSelecteedCitoyenDate] = useState(new Date());

  const [formData, setFormData] = useState(initFormData)

  useEffect(()=>{
    const APICall = async ()=>{
      try{
        
        let data = await fetch("https://jeedeployementtest.herokuapp.com/citoyens")
        console.log(data);
        data = await data.json()
        setCitoyens(data)
        setLoading(false)
      }
      catch(err){
        console.log(err);
      }
    }
    if(loading){
      APICall();
    }
  },[])

  const showFormHandle = ()=>{
    console.log(showFrom);
    if(showFrom){
      document.getElementById("citoyenForm").style.display = "none";
      document.getElementById("showFormButton").setAttribute("class","btn btn-success");
      document.getElementById("showFormButton").textContent = "Ajouter un Citoyen";
      setShowFrom(false);
    }
    else{
      document.getElementById("citoyenForm").style.display = "";
      setShowFrom(true)
      window.scroll({
        top: document.body.scrollHeight,
        left: 100,
        behavior: 'smooth'
      });
      document.getElementById("showFormButton").setAttribute("class","btn btn-warning")
      document.getElementById("showFormButton").textContent = "Annuler l'ajout";
    }
  }

  const handleFormChange = (e)=>{
    setFormData({
      ...formData,
      [e.target.id]: e.target.value 
    })
  }

  const handleSubmit = (e)=>{
    e.preventDefault();
    const APICall = async ()=>{
      console.log({...formData,dateNaissance:formatDate(date)});
      let citoyen = {
       ...formData,
       datenaissance: formatDate(date),
       codepostal: parseInt(formData.codepostal)
      }
      setLoading(true);
      try{
        let res = await fetch("https://jeedeployementtest.herokuapp.com/citoyen",{
          method: "POST",
          body: JSON.stringify(citoyen),
          headers:{
            'Content-Type': 'application/json'
          }
        })
        res = await res.json()
        console.log(res);
        setCitoyens([...citoyens,{idcitoyen:res.idcitoyen,...citoyen}])
        setFormData(initFormData)
        setLoading(false)
        showFormHandle()
      }
      catch(err){
        console.log(err);
      }
    }
    APICall();
  }

  /**
   * 
   * @param {Date} date 
   */
  const formatDate = (date)=>{
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    if(month<10){
      month = "0"+month
    }
    if(day<10){
      day = "0"+day
    }
    return year + "-" + month + "-" + day;
  }

  const handleDelete = async (citoyen)=>{
  
    try{
      setCitoyens(citoyens.filter(ct=>ct.idcitoyen != citoyen.idcitoyen))
      let res = await fetch(`https://jeedeployementtest.herokuapp.com/citoyen/${citoyen.idcitoyen}`,{
        method: "DELETE"
      })
      // res = await res.json();
      console.log(res);
    }
    catch(err){
      console.log(err);
      setCitoyens([...citoyens,citoyen])
      alert("deleting faild")
    }
    
  }

  const handleSelectedCitoyen = (citoyen)=>{
    console.log("citoyen: ");
    console.log(citoyen);
    setSelecteedCitoyenDate(new Date(citoyen.datenaissance));
    setSelectedCitoyen(citoyen)
  }

  const handleSelectedCitoyenChange = (e)=>{
    setSelectedCitoyen({
      ...selectedCitoyen,
      [e.target.id.replace("Up","")]: e.target.value 
    })
  }

  const handleUpdate = async ()=>{
    let oldCitoyen;
    try{
      let newCitoyen = {
        ...selectedCitoyen,
        datenaissance: formatDate(selectedCitoyenDate)
      }
      setCitoyens(citoyens.map(ct=>{
        if(ct.idcitoyen == selectedCitoyen.idcitoyen ){
          oldCitoyen = ct;
          return newCitoyen;
        }
        return ct;
      }))
      let res = await fetch(`https://jeedeployementtest.herokuapp.com/citoyen/${selectedCitoyen.idcitoyen}`,{
        method: "PUT",
        body: JSON.stringify(newCitoyen),
        headers:{
          'Content-Type': 'application/json'
        }
      })
      // let newCitoyen = await res.json();
      res.json().then(data=>console.log(data))
      // console.log(res);
      // let modalEl = document.getElementById("updateModal");
      // let modalIns = bootstrap.Modal.getInstance(modalEl);
      // modalIns.hide()
    }
    catch(err){
      console.log(err);
      setCitoyens(citoyens.map(ct=>{
        if(ct.idcitoyen == selectedCitoyen.idcitoyen ){
          return oldCitoyen;
        }
        return ct;
      }))
      alert("Updating faild")
    }
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-6 text-center">
          <p className="title">Gestion des citoyens</p>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="col-10">
          <ClipLoader size={100} loading={loading} />
          <table className="table-bordered table table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Adresse</th>
                <th>Date Naissance</th>
                <th>Nationalité</th>
                <th>Localite</th>
                <th>Code postal</th>
                <th>Pays</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {citoyens.length>0 && citoyens.map(citoyen=>(
                <tr key={citoyen.idcitoyen}>
                  <td>{citoyen.idcitoyen}</td>
                  <td>{citoyen.nom}</td>
                  <td>{citoyen.prenom}</td>
                  <td>{citoyen.adresse}</td>
                  <td>{citoyen.datenaissance}</td>
                  <td>{citoyen.nationalite}</td>
                  <td>{citoyen.localite}</td>
                  <td>{citoyen.codepostal}</td>
                  <td>{citoyen.pays}</td>
                  <td>
                    <span>
                      <button onClick={()=>{handleDelete(citoyen)}} className="mx-1 my-1 btn btn-danger">Delete</button>
                      <button onClick={()=>{handleSelectedCitoyen(citoyen)}} data-bs-toggle="modal" data-bs-target="#updateModal" 
                      type="button" className="mx-1 my-1 btn btn-warning">Update</button>
                    </span>
                  </td>
                </tr>
              ))}
              
            </tbody>
          </table>
        </div>
        <div className="row justify-content-center">
          <button onClick={showFormHandle} id="showFormButton" className="mt-5 mb-3 btn btn-success" style={{width:'80%'}}>Ajouter un Citoyen</button>
        </div>
        <div style={{display:"none"}} id="citoyenForm" className="row justify-content-center">
          <div className="col-6 mt-3 mb-3">
            <form onSubmit={handleSubmit}>
              <label htmlFor="#nom" className="mt-1">Nom</label>
              <input value={formData.nom} onChange={handleFormChange} id="nom" className="form-control mt-1" type="text"/>
              <label htmlFor="#prenom" className="mt-1">Prénom</label>
              <input value={formData.prenom} onChange={handleFormChange} id="prenom" className="form-control mt-1" type="text"/>
              <label htmlFor="#adresse" className="mt-1">Adresse</label>
              <input value={formData.adresse} onChange={handleFormChange} id="adresse" className="form-control mt-1" type="text"/>
              <label htmlFor="#dateNaissance" className="mt-1">Date Naissance</label><br></br>
              {/* <input id="dateNaissance" className="form-control mt-1" type="text"/> */}
              <DatePicker selected={date} onChange={date=>setDate(date)} className="form-control"/><br/>
              <label htmlFor="#nationalite" className="mt-1">Nationalite</label>
              <input value={formData.nationalite} onChange={handleFormChange} id="nationalite" className="form-control mt-1" type="text"/>
              <label htmlFor="#localite" className="mt-1">Localite</label>
              <input value={formData.localite} onChange={handleFormChange} id="localite" className="form-control mt-1" type="text"/>
              <label htmlFor="#codepostal" className="mt-1">Code postal</label>
              <input value={formData.codepostal} onChange={handleFormChange} id="codepostal" className="form-control mt-1" type="text"/>
              <label htmlFor="#pays" className="mt-1">Pays</label>
              <input value={formData.pays} onChange={handleFormChange} id="pays" className="form-control mt-1" type="text"/>
              <button type="submit" className="mt-3 btn btn-success">Ajouter</button>
            </form>
          </div>
        </div>
      </div>
            
      <div className="modal fade" id="updateModal" tabindex="-1" aria-labelledby="updateModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="updateModalLabel">Modifier le Citoyen ID: {selectedCitoyen.idcitoyen}</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form >
                <label htmlFor="#nomUp" className="mt-1">Nom</label>
                <input value={selectedCitoyen.nom} onChange={handleSelectedCitoyenChange} id="nomUp" className="form-control mt-1" type="text"/>
                <label htmlFor="#prenomUp" className="mt-1">Prénom</label>
                <input value={selectedCitoyen.prenom} onChange={handleSelectedCitoyenChange} id="prenomUp" className="form-control mt-1" type="text"/>
                <label htmlFor="#adresseUp" className="mt-1">Adresse</label>
                <input value={selectedCitoyen.adresse} onChange={handleSelectedCitoyenChange} id="adresseUp" className="form-control mt-1" type="text"/>
                <label htmlFor="#dateNaissanceUp" className="mt-1">Date Naissance</label><br></br>
                {/* <input id="dateNaissanceUp" className="form-control mt-1" type="text"/> */}
                <DatePicker selected={selectedCitoyenDate} onChange={date=>setSelecteedCitoyenDate(date)} className="form-control"/><br/>
                <label htmlFor="#nationaliteUp" className="mt-1">Nationalite</label>
                <input value={selectedCitoyen.nationalite} onChange={handleSelectedCitoyenChange} id="nationaliteUp" className="form-control mt-1" type="text"/>
                <label htmlFor="#localiteUp" className="mt-1">Localite</label>
                <input value={selectedCitoyen.localite} onChange={handleSelectedCitoyenChange} id="localiteUp" className="form-control mt-1" type="text"/>
                <label htmlFor="#codepostalUp" className="mt-1">Code postal</label>
                <input value={selectedCitoyen.codepostal} onChange={handleSelectedCitoyenChange} id="codepostalUp" className="form-control mt-1" type="text"/>
                <label htmlFor="#paysUp" className="mt-1">Pays</label>
                <input value={selectedCitoyen.pays} onChange={handleSelectedCitoyenChange} id="paysUp" className="form-control mt-1" type="text"/>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button onClick={handleUpdate} type="button" className="btn btn-primary" data-bs-dismiss="modal" >Save changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
