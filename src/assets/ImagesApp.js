const loadImage = async (imageName) => {
  switch (imageName) {
    case "sidebarImg":
      return import("./img/pan.jpg");
    case "inventario":
      return import("./img/inventario.jpg");
    case "maquinas":
      return import("./img/maquinas.jpg");
    case "sucursal":
      return import("./img/sucursal.jpg");
    case "logo":
      return import("./img/logo.webp");
    case "inpased":
      return import("./img/inpased.png");
    case "panaderia":
      return import("./img/panaderia.jpg");
    case "defImg":
      return import("./img/def-img.jpg");
    case "panadero":
      return import("./img/panadero.jpg");
    case "qr":
      return import("./img/qr.jpg");
    case "canasta":
      return import("./img/canasta.png");
    case "producto":
      return import("./img/panHD.jpg");
    default:
      return import("./img/def-img.jpg");

  }
};

export default loadImage;
