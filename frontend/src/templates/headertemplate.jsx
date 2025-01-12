export const headerTemplateString = `
React.createElement("div", { className: "mb-2 border-b border-[#000000] pb-2" },
  React.createElement("div", null,
    React.createElement("h1", { 
      className: "text-4xl tracking-wide text-center text-[#1a5f7a] uppercase"
    }, hospitalInfo?.name)
  ),
  React.createElement("div", { style: { display: "flex", flexDirection: "row" } },
    React.createElement("div", { style: { marginLeft: 50 } },
      React.createElement("img", {
        src: hospitalInfo?.hospitalLogoBlob,
        alt: "Clinic Logo",
        className: "w-[100px] h-[100px]"
      })
    ),
    React.createElement("div", { className: "ml-8" },
      React.createElement("p", { className: "text-center text-[#333333]" }, 
        hospitalInfo?.address
      ),
      React.createElement("h2", { className: "text-center text-[#1a5f7a] text-xl" },
        hospitalInfo?.doctorName
      ),
      React.createElement("p", { className: "text-center text-[#333333]" },
        hospitalInfo?.doctorInfo
      ),
      React.createElement("p", { className: "text-center text-[#333333]" },
        "Mob : ", hospitalInfo?.contactNumber
      )
    ),
    React.createElement("div", null,
      React.createElement("img", {
        src: hospitalInfo?.hospitalLogo2Blob,
        alt: "Clinic Logo",
        className: "w-[120px] h-[100px]"
      })
    )
  )
)`;
