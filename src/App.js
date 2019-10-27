import React, { Component } from 'react';
import './App.css';
import { Modal } from './Modal';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      restos: [],
      isLoading: false,
      error: null,
      nbResto: 10,
      page: 1,
      maxpage: 1,
      showNewResto: false,
      currentResto: { "nom": "", "cuisine": "" },
      showEditResto: false,
      endTime: 0,
      restoName: '',
    };
  }

  doSearch() {
    let s = new Date().getTime();
    this.setState({ endTime: s }, () => {
      this.doWait(s);
    })
  }

  doWait(lastTime) {
    setTimeout(function () {
      if (lastTime === this.state.endTime) {
        console.log("do some job " + Math.random());
        let str = document.getElementById("searchInput").value;
        if (this.state.restoName !== str) {
          console.log("searching for " + str);
          this.setState({ restoName: str }, () => {
            this.componentDidMount();
          });
        }
      }
    }.bind(this), 1000);
  }

  handleSelect(event) {
    this.setState({ nbResto: event.target.value }, () => this.componentDidMount());
  }

  getMaxpage(respHandler) {
    fetch("http://localhost:8080/api/restaurants/count")
      .then(response => {
        return response.json();
      }).then(resp => {
        let maxpagevalue = Math.ceil(resp.data / this.state.nbResto) - 1;
        this.setState({ maxpage: maxpagevalue, page: maxpagevalue })
      }).then(resp => {
        respHandler();
      });
  }

  newResto(event) {
    console.log(event);
    this.setState({ showNewResto: true }, () => console.log(this.state.showNewResto));
  }

  closeNewResto() {
    this.setState({ showNewResto: false });
  }

  editResto(event) {
    console.log(event);
    this.setState({ showEditResto: true });
  }

  closeEditResto() {
    this.setState({ showEditResto: false });
  }

  creerResto(event) {
    event.preventDefault();
    console.log(event);
    let nom = document.getElementById('restaurantInputI').value;
    let cuisine = document.getElementById('cuisineInputI').value;
    if (nom === "" || cuisine === "") { return; }
    console.log("nom=" + nom + " cuisine=" + cuisine);
    let form = new FormData(document.getElementById('formulaireInsertionform'));
    fetch('http://localhost:8080/api/restaurants', {
      method: 'POST',
      body: form
    }).then((response) => {
      if (response.ok) {
        return response
      } else {
        throw new Error('Something went wrong ...');
      }
    }).then((resp) => {
      console.log(resp);
      this.getMaxpage(() => {
        this.setState({ page: this.state.maxpage }, () => {
          this.componentDidMount();
          document.getElementById("formulaireInsertionform").reset();
          this.changeButtons(0, this.state.page - 2, this.state.page - 1);
        });
      });
    }).catch(error => this.setState({ error, isLoading: false }));
    this.closeNewResto();
  }

  updateResto(event) {
    console.log(event);
    event.preventDefault();
    let nom = document.getElementById('restaurantInputI2').value;
    let cuisine = document.getElementById('cuisineInputI2').value;
    if (nom === "" || cuisine === "") { return; }
    console.log("nom=" + nom + " cuisine=" + cuisine);
    let form = new FormData(document.getElementById('formulaireInsertionform2'));
    fetch('http://localhost:8080/api/restaurants/' + document.getElementById('idInputI2').value, {
      method: 'PUT',
      body: form
    }).then((response) => {
      if (response.ok) {
        return response
      } else {
        throw new Error('Something went wrong ...');
      }
    }).then((resp) => {
      console.log(resp);
      this.setState({ currentResto: { "nom": "", "cuisine": "" } }, () => {
        this.componentDidMount();
        document.getElementById("formulaireInsertionform2").reset();
      });
    }).catch(error => this.setState({ error, isLoading: false }));
    this.closeEditResto();
  }

  navigate(event) {
    let butn = event.target.innerText;
    let bid = event.target.id;
    let num = 1;
    if (butn === 'max') {
      this.getMaxpage(() => {
        this.changeButtons(0, this.state.page - 2, this.state.page - 1);
        this.componentDidMount();
      });
      return;

    } else if (butn !== 'min') {
      num = parseInt(butn);
      if (bid === "secondButton" && num > 2) {
        this.setState({ page: num }, () => this.componentDidMount());
        this.changeButtons(-1);
        return;
      } else if (bid === "thirdButton") {
        this.getMaxpage(() => {
          if (num <= this.state.maxpage) {
            this.setState({ page: num }, () => this.componentDidMount());
            if (num !== this.state.maxpage) {
              this.changeButtons(1);
            }
          }
        });
        return
      }
    }
    this.setState({ page: num }, () => this.componentDidMount());
    this.changeButtons(0, 2, 3);
  }

  changeButtons(i = 0, b = 0, c = 0) {
    if (b === 0 && c === 0) {
      b = document.querySelector('#secondButton').innerHTML;
      c = document.querySelector('#thirdButton').innerHTML;
    }
    document.querySelector('#secondButton').innerHTML = parseInt(b) + i;
    document.querySelector('#thirdButton').innerHTML = parseInt(c) + i;
  }

  afficherRestaurant(event, resto) {
    console.log(event);
    console.log(resto);
    this.setState({ currentResto: resto }, () => {
      this.setState({ showEditResto: true }, () => console.log(this.state.currentResto));
    });
  }

  removeRestaurant(event, resto) {
    console.log(event);
    let url = "http://localhost:8080/api/restaurants/" + resto._id;
    console.log("url " + url);
    fetch(url, {
      method: 'delete'
    }).then(response => {
      console.log(response);
      this.componentDidMount();
    });
  }

  componentDidMount() {
    this.setState({ isLoading: true });
    fetch('http://localhost:8080/api/restaurants?page=' + this.state.page + "&pagesize=" + this.state.nbResto + "&name=" + this.state.restoName)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Something went wrong ...');
        }
      }).then((restos) => {
        const restosdata = restos.data;
        this.setState({ restos: restosdata, isLoading: false }); //pour quoi restos.data ne marche pas ?
        console.log(restosdata);
        console.log("page = " + this.state.page);
      }).catch(error => this.setState({ error, isLoading: false }));
  }
  render() {

    let nouveauRestaurantModal = () => {
      return (
        <div>
          <br />
          <div className="col-lg" id="formulaireInsertion">
            <div className="card">
              <div className="card-body">
                <form id="formulaireInsertionform">
                  <div className="form-group">
                    <label htmlFor="restaurantInput">Nom</label>
                    <input className="form-control" id="restaurantInputI" type="text" name="nom" required placeholder="Michel's restaurant" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cuisineInput">Cuisine</label>
                    <input className="form-control" id="cuisineInputI" type="text" name="cuisine" required placeholder="Michel's cuisine" />
                  </div>
                  <button className="btn btn-primary" onClick={(event) => this.creerResto(event)}>Créer restaurant</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      );
    }

    let ModifierRestaurantModal = () => {
      return (
        <div>
          <br />
          <div className="col-lg" id="formulaireInsertion">
            <div className="card">
              <div className="card-body">
                <form id="formulaireInsertionform2">
                  <input className="form-control" id="idInputI2" type="text" name="_id" defaultValue={this.state.currentResto._id} hidden={true} />
                  <div className="form-group">
                    <label htmlFor="restaurantInput">Nom</label>
                    <input className="form-control" id="restaurantInputI2" type="text" name="nom" required defaultValue={this.state.currentResto.name} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cuisineInput">Cuisine</label>
                    <input className="form-control" id="cuisineInputI2" type="text" name="cuisine" required defaultValue={this.state.currentResto.cuisine} />
                  </div>
                  <button className="btn btn-primary" onClick={(event) => this.updateResto(event)}>Update restaurant</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      );
    }

    let loading = () => {
      if (this.state.isLoading) {
        return ("Loading...");
      }
    }
    if (this.state.error) {
      return <p>{this.state.error.message}</p>;
    }
    let listeRestos = this.state.restos.map((resto, id) => {
      return (
        <tr v-for="(restaurant,index) in filteredrestaurants" key={id}>
          <td>{resto.name}</td>
          <td>{resto.cuisine}</td>
          <td>
            <button className="btn btn-primary" value={resto} onClick={(event) => this.afficherRestaurant(event, resto)}><i className="fa fa-edit"></i></button>
            <button className="btn btn-primary" value={resto} onClick={(event) => this.removeRestaurant(event, resto)}><i className="fa fa-trash"></i></button>
          </td>
        </tr>
      )
    }
    );
    return (
      <div className="App">
        <div class="jumbotron">
          <h2>Liste des Restaurants</h2>
          <h3>{loading()}</h3>
          <form>
            <div class="form-group">
              <button type="button" className="btn btn-primary mb-3" id="createButton" onClick={(event) => this.newResto(event)}>Ajouter Restaurant</button>
            </div>
            <div class="form-group">
              <label>Nombre de restaurant par page</label>

              <select id="elementPageDropDown" onChange={(event) => this.handleSelect(event)}>
                <option value="5">5</option>
                <option value="10" >10</option>
                <option value="15">15</option>
              </select>
            </div>
            <div class="form-group form-check">
              <input id="searchInput" className="form-control"
                placeholder="Chercher par nom" onChange={() => this.doSearch()} />
            </div>
          </form>


        </div>

        <div class="container">
          <table className="table table-striped" id="myTable">
            <thead className="thead-dark">
              <tr>
                <th>Nom</th>
                <th>Cuisine</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {listeRestos}
            </tbody>
          </table>
          <div className="navigation">
            <button type="button" className="btn btn-primary" id="firstButton" onClick={(event) => this.navigate(event)}>&lt;&lt;</button>
            <button type="button" className="btn btn-primary" id="secondButton" onClick={(event) => this.navigate(event)}>2</button>
            <button type="button" className="btn btn-primary" id="thirdButton" onClick={(event) => this.navigate(event)}>3</button>
            ...
                    <button type="button" className="btn btn-primary" id="lastPageButton" onClick={(event) => this.navigate(event)} >&gt;&gt;</button>
          </div>
          <Modal show={this.state.showNewResto} handleClose={() => this.closeNewResto()} children={nouveauRestaurantModal()}></Modal>
          <Modal show={this.state.showEditResto} handleClose={() => this.closeEditResto()} children={ModifierRestaurantModal()}></Modal>
        </div>
      </div>
    );
  }
}

export default App;
