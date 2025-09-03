import React from 'react'
import "./itemholder.css"

function ItemHolder({title, number, to}) {
  return (
    <div className='item-card'>
        <div className='ic-title-item2'>
   <div className='ic-title-item'>
{/* <i className='icon2' class="fi fi-rr-laptop"></i> */}
<p className='item-name'>{title ||"Electronics"}</p>
<p>{to || ""}</p>
</div>
      <div className='item-number'>
       {number ||" 200,000"}
        </div>   
        </div>

    </div>
  )
}

export default ItemHolder