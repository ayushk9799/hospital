import React, { useRef } from 'react'
import { useReactToPrint } from 'react-to-print';
const HeaderCom = () => {
  return (
    <div className="mb-2 border-b border-black pb-2">
    <div>
      <h1 className="text-center text-2xl font-bold text-[#1a5f7a] mb-1">
        KIDNEY STONE & UROLOGY CLINIC
      </h1>
    </div>
    <div className="flex flex-row">
      <div className="ml-12">
        <img
          src={require("../components/custom/reports/Capture2.png")}
          className="w-[70px]"
          alt="Clinic Logo"
        />
      </div>
      <div className="absolute w-full">
        <p className="text-center text-xs text-[#333333]">
          Jail Road, Near Mahindra Showroom, Tilkamanjhi, Bhagalpur
        </p>
        <p className="text-center text-sm tracking-wider text-[#1a5f7a] mt-1">
          DR. RAJAN KUMAR SINHA
        </p>
        <p className="text-center text-xs text-[#333333]">
          M.B.B.S(Ranchi), MS(Gen.Surgery), MCh(Urology), Kolkata
        </p>
        <p className="text-center text-xs text-[#333333]">Consultant Urologist</p>
        <p className="text-center text-xs text-[#333333]">Mob : 9709993104</p>
      </div>
    </div>
  </div>
  )
}

const Analytics = () => {
  const ref = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => ref.current,
  });

  return (
    <div>
      <div ref={ref}>
      <HeaderCom />
      </div>
      <button onClick={handlePrint}>Print</button>
    </div>
  )
}

export default Analytics