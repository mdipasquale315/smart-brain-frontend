import React, { Component } from 'react';
// import Particles from 'react-particles-js'; 
import ParticlesBg from 'particles-bg'
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import './App.css';

const initialState = {
  input: '',
  imageUrl: '',
  boxes: [], // Changed to array to hold multiple boxes
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  // Updated to handle multiple face boxes
  calculateFaceLocations = (data) => {
    const regions = data.outputs[0]?.data?.regions;
    if (!regions || regions.length === 0) {
      return [];
    }

    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);

    return regions.map(region => {
      const clarifaiFace = region.region_info.bounding_box;
      return {
        leftCol: clarifaiFace.left_col * width,
        topRow: clarifaiFace.top_row * height,
        rightCol: clarifaiFace.right_col * width,
        bottomRow: clarifaiFace.bottom_row * height
      };
    });
  }

  displayFaceBoxes = (boxes) => {
    this.setState({ boxes: boxes });
  }

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  }

  onButtonSubmit = () => {
    this.setState({ imageUrl: this.state.input }); // set imageUrl to display image
    fetch('https://smart-brain-backend-l6cv.onrender.com/imageurl', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: this.state.input }),
    })
    .then(res => res.json())
    .then(data => {
      if (data.faceBoxes) {
        this.displayFaceBoxes(this.calculateFaceLocations(data));
      } else {
        this.setState({ boxes: [] }); // no faces detected
      }
    })
    .catch(err => console.log('Error:', err));
  };

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render() {
    const { isSignedIn, imageUrl, route, boxes } = this.state;
    return (
      <div className="App">
        <ParticlesBg type="circle" bg={true} />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        { route === 'home'
          ? <div>
              <Logo />
              <Rank
                name={this.state.user.name}
                entries={this.state.user.entries}
              />
              <ImageLinkForm
                onInputChange={this.onInputChange}
                onButtonSubmit={this.onButtonSubmit}
              />
              <FaceRecognition box={boxes} imageUrl={imageUrl} />
            </div>
          : (
             route === 'signin'
             ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
             : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            )
        }
      </div>
    );
  }
}

export default App;
