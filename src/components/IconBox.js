import React from 'react'
import "./iconbox.css"


function IconBox({ object, title, number, backgroundImage, iconClass }) {
  return (
    <div className='ic-box' style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className='ic_box_text'>
        <i className={`icon ${iconClass}`}></i> 
        <p className='ib-title'>{title || 'No data'}</p>
        <p className='ib-numbers'>{number || 'No data'}</p> 
      </div>
      <div className='ic_box_image_holder'>
        <div className='spacer'></div>
        <img className='ic_box_img' src={object || ''} />
      </div>
    </div>
  );
}
export default IconBox