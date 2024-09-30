import React, { useState } from 'react'
import OPDRegDialog from '../components/custom/registration/OPDRegDialog'

const Analytics = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setIsOpen(true)}>open</button>
      <OPDRegDialog open={isOpen} onOpenChange={setIsOpen} />
    </div>
  )
}

export default Analytics