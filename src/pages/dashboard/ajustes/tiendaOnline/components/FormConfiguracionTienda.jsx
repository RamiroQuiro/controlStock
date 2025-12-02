import { useState, useEffect } from "react";
import {
  LayoutTemplate,
  Palette,
  Save,
  Store,
  ExternalLink,
  Eye,
  TextCursorIcon,
  X,
} from "lucide-react";
import LoaderReact from "../../../../../utils/loader/LoaderReact";
import InputComponenteJsx from "../../../dashboard/componente/InputComponenteJsx";
import Input from "../../../../../components/atomos/Input";
import { Textarea } from "../../../../../components/atomos/TextArea";

const themes = [
  {
    id: "clasica",
    name: "Clásica",
    description: "Diseño tradicional y confiable.",
    image: "/themes/clasica-preview.jpg",
  },
  {
    id: "moderna",
    name: "Moderna",
    description: "Estilo audaz con cabecera grande y colores vibrantes.",
    image: "/themes/moderna-preview.jpg",
  },
  {
    id: "minimal",
    name: "Minimalista",
    description: "Enfoque limpio en el producto, sin distracciones.",
    image: "/themes/minimal-preview.jpg",
  },
];

export default function FormConfiguracionTienda({ user }) {
  const [formData, setFormData] = useState({
    theme: "clasica",
    colorAsset: "#000000",
    colorSecundario: "#ffffff",
    nombreFantasia: "",
    textoHero: "",
    descripcionHero: "",
    imagenHero: null,
  });
  const [empresaData, setEmpresaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch tienda config
        const res = await fetch(`/api/ajustes/tienda`);
        if (res.ok) {
          const response = await res.json();
          const data = response.data;

          // Parse JSON fields
          const colores = data.colores ? JSON.parse(data.colores) : {};
          const textos = data.textos ? JSON.parse(data.textos) : {};

          setFormData({
            theme: data.theme || "clasica",
            colorAsset: colores.primary || "#000000",
            colorSecundario: colores.secondary || "#ffffff",
            nombreFantasia: textos.nombreTienda || "",
          });
        }

        // Fetch empresa data for URLs
        const empresaRes = await fetch(
          `/api/ajustes/empresa?empresaId=${user.empresaId}`
        );
        if (empresaRes.ok) {
          const empresaResponse = await empresaRes.json();
          setEmpresaData(empresaResponse.data);
        }
      } catch (error) {
        console.error("Error fetching store config:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.empresaId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleThemeSelect = (themeId) => {
    setFormData((prev) => ({ ...prev, theme: themeId }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        alert("Por favor selecciona una imagen válida");
        return;
      }

      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen no debe superar los 5MB");
        return;
      }

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);

      setFormData((prev) => ({ ...prev, imagenHero: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Preparar FormData si hay imagen
      let payload;
      let headers = {};

      if (formData.imagenHero) {
        // Si hay imagen, usar FormData
        const formDataToSend = new FormData();
        formDataToSend.append("theme", formData.theme);
        formDataToSend.append(
          "colores",
          JSON.stringify({
            primary: formData.colorAsset,
            secondary: formData.colorSecundario,
          })
        );
        formDataToSend.append(
          "textos",
          JSON.stringify({
            nombreTienda: formData.nombreFantasia,
            textoHero: formData.textoHero,
            descripcionHero: formData.descripcionHero,
          })
        );
        formDataToSend.append("imagenHero", formData.imagenHero);
        formDataToSend.append("activo", "true");

        payload = formDataToSend;
      } else {
        // Sin imagen, usar JSON
        headers["Content-Type"] = "application/json";
        payload = JSON.stringify({
          theme: formData.theme,
          colores: {
            primary: formData.colorAsset,
            secondary: formData.colorSecundario,
          },
          textos: {
            nombreTienda: formData.nombreFantasia,
            textoHero: formData.textoHero,
            descripcionHero: formData.descripcionHero,
          },
          activo: true,
        });
      }

      const res = await fetch("/api/ajustes/tienda", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Configuración de tienda actualizada correctamente");
      }
    } catch (error) {
      console.error("Error saving store config:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoaderReact />;

  // Generate friendly URL slug
  const urlSlug = empresaData?.nombreFantasia || empresaData?.razonSocial || "";
  const catalogoUrl = `/catalogo/${user.empresaId}`;
  const tiendaUrl = `/tienda/${urlSlug}`;

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm w-full">
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <div className="flex items-center gap-3">
          <Store className="w-8 h-8 text-primary-100" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Personalizar Tienda Online
            </h2>
            <p className="text-gray-500 text-sm">
              Define cómo ven tus clientes tu catálogo digital
            </p>
          </div>
        </div>

        {/* Botones de Vista Previa */}
        {empresaData && (
          <div className="flex gap-2">
            <a
              href={catalogoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              <Eye className="w-4 h-4" />
              Ver Catálogo
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={tiendaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
            >
              <Store className="w-4 h-4" />
              Ver Tienda
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Selección de Tema */}
        <section>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5" /> Selecciona un Diseño
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themes.map((theme) => (
              <div
                key={theme.id}
                onClick={() => handleThemeSelect(theme.id)}
                className={`
                  cursor-pointer border-2 rounded-xl p-4 transition-all hover:shadow-md
                  ${formData.theme === theme.id ? "border-primary-100 bg-primary-50/10" : "border-gray-200 hover:border-gray-300"}
                `}
              >
                <div className="h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400">
                  <LayoutTemplate className="w-10 h-10" />
                </div>
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-gray-800">{theme.name}</h4>
                  {formData.theme === theme.id && (
                    <span className="bg-primary-100 text-white text-xs px-2 py-1 rounded-full">
                      Activo
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{theme.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Colores y Marca */}
        <section>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5" /> Identidad de Marca
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de Fantasía (Visible en la tienda)
              </label>
              <Input
                name="nombreFantasia"
                value={formData.nombreFantasia}
                onChange={handleChange}
                placeholder="Ej: Mi Tienda Genial"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <div className=" flex items-start justify-start">
                <div
                  style={{
                    backgroundColor: formData.colorAsset,
                  }}
                  className="flex items-center border p-4 border-gray-200 rounded-lg justify-start gap-1"
                >
                  <Input
                    label="Color Principal"
                    type="color"
                    name="colorAsset"
                    value={formData.colorAsset}
                    onChange={handleChange}
                    className="h-10 w-10 rounded-full text-primary-textoTitle cursor-pointer border-0 p-0"
                  />
                  <span className="text-sm w-fit text-gray-500 uppercase">
                    {formData.colorAsset}
                  </span>
                </div>
              </div>

              <div className=" flex items-start justify-start">
                <div
                  style={{
                    backgroundColor: formData.colorSecundario,
                  }}
                  className="flex items-center border p-4 border-gray-200 rounded-lg justify-start gap-1"
                >
                  <Input
                    label="Color Secundario"
                    type="color"
                    name="colorSecundario"
                    value={formData.colorSecundario}
                    onChange={handleChange}
                    className="h-10 w-10 rounded-full text-primary-textoTitle cursor-pointer border-0 p-0"
                  />
                  <span className="text-sm text-gray-500 uppercase">
                    {formData.colorSecundario}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* textos - */}
        <section>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <TextCursorIcon className="w-5 h-5" /> Textos
          </h3>
          <div className="flex items-center w-full justify-between gap-2 flex-col md:flex-row">
            <div className=" flex items-start justify-start w-full">
              <Textarea
                label="Texto Hero"
                name="textoHero"
                cols={50}
                rows={5}
                value={formData.textoHero}
                onChange={handleChange}
                placeholder="Ej: Mi Tienda Genial"
              />
            </div>
            <div className=" flex items-start justify-start w-full">
              <Textarea
                label="Descripcion Hero"
                name="descripcionHero"
                value={formData.descripcionHero}
                cols={50}
                rows={5}
                onChange={handleChange}
                placeholder="Ej: Mi Tienda Genial"
              />
            </div>
          </div>
        </section>

        {/* Imagen Hero */}
        <section>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5" /> Imagen del Hero
          </h3>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary-100 transition-colors">
              <input
                type="file"
                id="imagenHero"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="imagenHero"
                className="cursor-pointer flex flex-col items-center justify-center gap-3"
              >
                {previewImage ? (
                  <div className="relative w-full max-w-md">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setPreviewImage(null);
                        setFormData((prev) => ({ ...prev, imagenHero: null }));
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <LayoutTemplate className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">
                        Click para subir imagen del Hero
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG hasta 5MB
                      </p>
                    </div>
                  </>
                )}
              </label>
            </div>
            <p className="text-xs text-gray-500">
              Esta imagen se mostrará como fondo en la sección Hero de tu tienda
            </p>
          </div>
        </section>

        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-primary-100 text-white px-6 py-2.5 rounded-lg hover:bg-primary-200 transition-colors disabled:opacity-50"
          >
            {saving ? <LoaderReact size="sm" /> : <Save className="w-5 h-5" />}
            Guardar Configuración
          </button>
        </div>
      </form>
    </div>
  );
}
