
import { useEffect } from 'react';
import { loadFull } from 'tsparticles';
import { tsParticles } from 'tsparticles-engine';
import particles404Config from './tsParticles.js';
import { Link } from 'react-router-dom';
import HelmetComponent from '~/components/Helmet.jsx';
import { astronaut, planet } from '~/constants/images.js';
import './style.css'; 

const Page404 = () => {
  useEffect(() => {
    const initParticles = async () => {
      await loadFull(tsParticles);
      await tsParticles.load('tsparticles', particles404Config);
    };

    initParticles();
  }, []);

  return (
    <div className="permission_denied">
           <HelmetComponent title="Lỗi" />
      <div id="tsparticles"></div>
      <div className="denied__wrapper">
        <h1>404</h1>
        <h3>
          Trang không tồn tại, vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ
        </h3>
        <img id="astronaut" src={astronaut} alt="astronaut" />
        <img id="planet" src={planet} alt="planet" />
        <Link to="/">
          <button className="denied__link">Go Home</button>
        </Link>
      </div>
    </div>
  );
};

export default Page404;
