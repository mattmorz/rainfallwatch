import React from 'react';

import Nav from './Nav.jsx';
import Weather from './Weather.jsx';
import Footer from './Footer.jsx';

export default class Home extends React.Component {
   render() {
     const containerStyle = {
       marginTop : "100px"
     };
      return (
        <div>
          <Nav/>
          <Weather/>
          <Footer/>
        </div>
      );
   }
}
