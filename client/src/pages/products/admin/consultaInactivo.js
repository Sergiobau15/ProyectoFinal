import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import AdminLayout from '../../../components/AdminLayout';
import StoreKeeperLayout from '../../../components/StoreKeeperLayout';
import Modal from 'react-modal'; // Librería para modales

Modal.setAppElement('#root'); // Para accesibilidad

const AdministradorConsultaProductoInactivo = () => {
  const [inactiveProducts, setInactiveProducts] = useState([]);
  const [userRole, setUserRole] = useState(null);

  // Estado para controlar el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [description, setDescription] = useState('');

  // Fetch productos inactivos desde el backend
  const fetchInactiveProducts = async () => {
    try {
      const response = await Axios.get('http://localhost:3002/products/productsInactive');
      console.log("Respuesta de productos inactivos:", response.data);  // Verifica lo que llega
      setInactiveProducts(response.data);  // Establecer los productos inactivos en el estado
    } catch (error) {
      console.error('Error fetching inactive products:', error);
    }
  };

  // Función para activar el producto
  const activateProduct = async (productId, reason) => {
    console.log("Activando producto con ID:", productId);  // Verifica que el ID del producto se pase correctamente
    console.log("Motivo de la activación:", reason);  // Verifica que el motivo se pase correctamente

    const userSession = sessionStorage.getItem('usuario');
    const sessionData = userSession ? JSON.parse(userSession) : null;
    const userId = sessionData ? sessionData.ID : null;  // Usar el ID del usuario actual

    if (!userId) {
      console.error("No se encontró el ID del usuario");
      alert("No se encontró el ID del usuario.");
      return;
    }

    try {
      const response = await Axios.put(`http://localhost:3002/products/activate/${productId}`, { 
        description: reason, 
        userId: userId // Enviar el ID del usuario que está activando el producto
      });
      console.log("Producto activado:", response.data);

      // Actualiza el estado local para reflejar el cambio
      setInactiveProducts(inactiveProducts.filter(product => product.id !== productId));
      setIsModalOpen(false);  // Cerrar el modal
    } catch (error) {
      console.error("Error activando producto:", error);
    }
  };

  // Abrir el modal cuando se selecciona un producto
  const openModal = (product) => {
    console.log("Producto seleccionado:", product);  // Verifica que el producto se pase correctamente
    setSelectedProduct(product);  // Guardar el producto seleccionado
    setIsModalOpen(true);         // Abrir el modal
  };

  // Cerrar el modal
  const closeModal = () => {
    setIsModalOpen(false);        // Cerrar el modal
    setDescription('');           // Limpiar el campo de descripción
  };

  // Hook useEffect para cargar productos inactivos y datos del usuario
  useEffect(() => {
    fetchInactiveProducts();
    const userSession = sessionStorage.getItem('usuario');
    if (userSession) {
      const sessionData = JSON.parse(userSession);
      console.log('Datos del usuario:', sessionData);
      setUserRole(sessionData.Rol);
    }
  }, []);

  // Función para renderizar los productos inactivos
  const renderInactiveProducts = () => (
    <div className="flex flex-col h-full bg-gray-100">
      <main className="flex-grow p-4 overflow-y-auto">
        <center>
          <h1 className="text-3xl mb-6 p-6 bg-gray-700 text-white font-bold rounded-lg shadow-md">
            Productos Inactivos
          </h1>
        </center>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {inactiveProducts.length === 0 ? (
            <p>No hay productos inactivos disponibles.</p>
          ) : (
            inactiveProducts.map(product => (
              <div key={product.id} className="bg-white p-4 rounded-lg shadow-lg flex flex-col justify-between min-h-[400px]">
                <div className="relative w-full h-32 bg-gray-200 rounded overflow-hidden">
                  <img
                    src={product.imagen}
                    alt={product.nombre}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col flex-grow">
                  <h2 className="text-xl font-semibold mb-2 break-words">{product.nombre}</h2>
                  <p className="text-gray-700 mb-2">Stock: {product.cantidad}</p>
                  <p className="text-gray-700 mb-2">Precio: ${product.precio}</p>
                  <p className="text-gray-700 mb-4 flex-grow break-words">{product.descripcion}</p>
                </div>
                <button
                  onClick={() => openModal(product)}
                  className="mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700"
                >
                  Activar Producto
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );

  // Función para renderizar el layout según el rol del usuario
  const renderLayout = () => {
    if (userRole === 'Administrador') {
      return <AdminLayout>{renderInactiveProducts()}</AdminLayout>;
    } else if (userRole === 'Almacenista') {
      return <StoreKeeperLayout>{renderInactiveProducts()}</StoreKeeperLayout>;
    }
    return null;
  };

  return (
    <>
      {renderLayout()}

      {/* Modal de confirmación */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Confirmar Activación de Producto"
        className="bg-white p-6 rounded-lg shadow-lg w-96 mx-auto"
      >
        <h2 className="text-xl font-semibold mb-4">Confirmar Activación del Producto</h2>
        <p>Estás por activar el producto: <strong>{selectedProduct?.nombre}</strong></p>
        <textarea
          placeholder="Motivo de la activación..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-4 w-full p-2 border border-gray-300 rounded-lg"
          rows="4"
        ></textarea>
        <div className="mt-4 flex justify-between">
          <button
            onClick={closeModal}
            className="bg-gray-400 text-white py-2 px-4 rounded"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              console.log("Motivo de la activación:", description);  // Verifica que el motivo esté presente
              if (description.trim() !== '') {
                activateProduct(selectedProduct.id, description);
              } else {
                alert('Por favor ingresa un motivo para activar el producto.');
              }
            }}
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            Activar
          </button>
        </div>
      </Modal>
    </>
  );
};

export default AdministradorConsultaProductoInactivo;
