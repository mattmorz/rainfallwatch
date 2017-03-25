import React from 'react';

export default class Footer extends React.Component {
   render() {
     const footerStyle = {
       padding: "15px"
     }
      return (
        <footer className="footer" style={footerStyle}>
           <br/>
           <p className="text-muted">A React App by <a href="http://edselmatt.com" target="_blank">edselmatt</a></p>
       </footer>
      );
   }
}
