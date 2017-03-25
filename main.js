import React from 'react';
import ReactDOM from 'react-dom';
import Home from './components/Home.jsx';
import $ from 'jquery';
import './stylesheets/bootstrap/css/bootstrap.min.css';
import './stylesheets/bootstrap/js/bootstrap.min.js';


const app = document.getElementById('app');

ReactDOM.render(<Home/>,
  app);
