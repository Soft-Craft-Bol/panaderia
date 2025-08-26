from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
import time
from datetime import datetime, timedelta

def test_login(username, password):
    driver = webdriver.Chrome()
    driver.maximize_window()
    driver.get("http://localhost:5173/login")

    try:
        wait = WebDriverWait(driver, 20)
        
        # Iniciar sesión
        username_field = wait.until(EC.element_to_be_clickable((By.NAME, "username")))
        username_field.send_keys(username)
        
        password_field = wait.until(EC.element_to_be_clickable((By.NAME, "password")))
        password_field.send_keys(password)
        
        login_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']")))
        login_button.click()
        
        time.sleep(2)
        print("Página actual después de login:", driver.current_url)
        wait.until(EC.url_contains("/home"))
        print("Inicio de sesión exitoso")
        
        # Navegar a Productos en Venta
        time.sleep(2)
        sidebar = wait.until(EC.element_to_be_clickable((By.CLASS_NAME, "sidebar")))
        productos_link = wait.until(EC.element_to_be_clickable((By.XPATH, "//span[text()='Punto de Venta']")))
        productos_link.click()
        
        wait.until(EC.url_contains("/productos-ventas"))
        print("Navegación a Productos en Venta exitosa")
        
        # Esperar a que carguen los productos
        time.sleep(3)
        
        # Seleccionar el primer producto de la lista
        print("Seleccionando el primer producto de la lista...")
        primer_producto = wait.until(EC.element_to_be_clickable(
            (By.CSS_SELECTOR, "div.producto-card:first-child")
        ))
        
        # Obtener información del producto para verificación
        nombre_producto = primer_producto.find_element(By.CSS_SELECTOR, "h3.producto-name").text
        codigo_producto = primer_producto.find_element(By.CSS_SELECTOR, "span.detail-value").text
        print(f"Producto seleccionado: {nombre_producto} (Código: {codigo_producto})")
        
        primer_producto.click()
        print("Primer producto seleccionado")
        
        # Esperar a que se agregue al carrito
        time.sleep(2)
        
        # Abrir el carrito
        print("Abriendo carrito...")
        carrito_btn = wait.until(EC.element_to_be_clickable(
            (By.CSS_SELECTOR, ".cart-toggle-btn")
        ))
        carrito_btn.click()
        time.sleep(1)
        
        # Verificar que el producto está en el carrito
        try:
            wait.until(EC.presence_of_element_located(
                (By.XPATH, f"//div[contains(@class, 'cart-item')]//span[contains(text(), '{nombre_producto}')]")
            ))
            print(f"Producto '{nombre_producto}' encontrado en el carrito")
        except:
            print("Advertencia: No se pudo confirmar que el producto está en el carrito")
        
        # Hacer clic en el botón de Facturación
        print("Haciendo clic en Facturación...")
        facturacion_btn = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(@class, 'invoice-checkout') and contains(text(), 'Facturación')]")
        ))
        facturacion_btn.click()
        
        # Esperar a que se redirija a impuestos-form1
        wait.until(EC.url_contains("/impuestos-form1"))
        print("Navegación a impuestos-form1 exitosa")
        
        # Ingresar número de documento (3655579015)
        print("Ingresando número de documento...")
        doc_field = wait.until(EC.element_to_be_clickable(
            (By.CSS_SELECTOR, "input[name='numeroDocumento']")
        ))
        doc_field.clear()
        doc_field.send_keys("3655579015")
        print("Número de documento ingresado (la búsqueda es automática)")
        
        # Esperar a que complete la búsqueda automática
        time.sleep(2)
        
        # Hacer scroll hacia abajo para asegurar visibilidad de los elementos
        print("Haciendo scroll para mostrar elementos del formulario...")
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight)")
        # Resto del código para emitir factura...
        emitir_btn = wait.until(EC.presence_of_element_located(
            (By.XPATH, "//button[contains(text(), 'Emitir Factura')]")
        ))
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", emitir_btn)
        time.sleep(1)
        
        print("Emitiendo factura...")
        emitir_btn.click()
        
        # Esperar y manejar el modal final
        time.sleep(3)
        try:
            wait.until(EC.presence_of_element_located(
                (By.XPATH, "//h3[contains(text(), 'Factura Generada')]")
            ))
            print("Factura emitida exitosamente")
            
            print("Seleccionando Salir...")
            salir_btn = wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(text(), 'Salir')]")
            ))
            salir_btn.click()
            print("Saliendo del formulario de facturación")
            
            wait.until(EC.url_contains("/ventas"))
            print("Redirección a ventas exitosa")
            
            # Navegar a Eventos en el sidebar
            print("Navegando a Eventos...")
            time.sleep(2)
            sidebar = wait.until(EC.element_to_be_clickable((By.CLASS_NAME, "sidebar")))
            eventos_link = wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//span[text()='Gestión de Eventos']")
            ))
            eventos_link.click()
            
            wait.until(EC.url_contains("/event-manager"))
            print("Navegación a Eventos exitosa")
            
            # Obtener nuevo CUFD
            print("Obteniendo nuevo CUFD...")
            #delay 56 segundos antes de presionar obtner Cufd
            time.sleep(56)
            obtener_cufd_btn = wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(text(), 'Obtener CUFD')]")
            ))
            obtener_cufd_btn.click()
            
            # Esperar a que se complete la obtención del CUFD
            try:
                wait.until(EC.presence_of_element_located(
                    (By.XPATH, "//*[contains(text(), 'CUFD obtenido correctamente') or contains(text(), 'CUFDE generado')]")
                ))
                print("CUFD obtenido exitosamente")
            except:
                print("No se pudo confirmar visualmente la obtención del CUFD, continuando...")
            
            # Crear evento significativo
            print("Creando evento significativo...")
            evento_btn = wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(text(), 'Evento Significativo')]")
            ))
            evento_btn.click()
            
            # Esperar a que aparezca el formulario de evento
            wait.until(EC.presence_of_element_located(
                (By.XPATH, "//h3[contains(text(), 'Registro de Evento Significativo')]")
            ))
            print("Formulario de evento significativo cargado")
            
            # Enviar formulario
            print("Enviando formulario de evento...")
            submit_btn = wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(text(), 'Registrar Evento')]")
            ))
            submit_btn.click()

            # Esperar a que aparezca el modal de confirmación y cerrarlo
            try:
                wait.until(EC.presence_of_element_located(
                    (By.XPATH, "//div[contains(@class, 'modal-content')]//h3[contains(text(), 'Resultado del evento')]")
                ))
                print("Modal de confirmación de evento apareció")
                
                # Cerrar el modal de confirmación
                cerrar_modal_btn = wait.until(EC.element_to_be_clickable(
                    (By.XPATH, "//div[contains(@class, 'modal-content')]//button[contains(text(), 'Cerrar')]")
                ))
                cerrar_modal_btn.click()
                print("Modal de evento cerrado")
                
                # Esperar a que el modal desaparezca completamente
                wait.until(EC.invisibility_of_element_located(
                    (By.XPATH, "//div[contains(@class, 'modal-overlay')]")
                ))
            except Exception as e:
                print("No se pudo manejar el modal de confirmación:", str(e))

            # Continuar con el segundo formulario
            wait.until(EC.presence_of_element_located(
                (By.XPATH, "//h2[contains(text(), 'Registro de Evento con CAFc')]")
            ))
            print("Formulario de envío de paquete cargado")

            # Repite el mismo patrón para los otros pasos
                        
            
        except Exception as e:
            print("No se pudo confirmar la emisión de la factura:", str(e))
        
    except Exception as e:
        print(f"Error completo: {str(e)}")
        driver.save_screenshot("error.png")
        print("Se ha guardado un screenshot del error como 'error.png'")
        raise e
        
    finally:
        time.sleep(3)
        driver.quit()

test_login("Gaspar", "armando1gaspar")