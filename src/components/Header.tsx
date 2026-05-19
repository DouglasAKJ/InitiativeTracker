import {Swords, Target} from 'lucide-react';


function Header(){
    return(
        <header className="main-header">
        <div className="header-content">
          <Swords className="header-icon" size={40} />
          <h1 className="medieval-title">Controlador de Iniciativas</h1>
          <Target className="header-icon" size={40} />
        </div>
        <p className="subtitle">by poug.</p>
      </header>
    )
}

export default Header;