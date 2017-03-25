import React from 'react';
import Home from './Home.jsx';

export default class Content extends React.Component {

   render() {
      return (
         <div className="container-fluid">
           <div>{this.props.headerProp}</div>
         </div>
      );
   }
}
