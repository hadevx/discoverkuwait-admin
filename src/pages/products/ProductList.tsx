import { useState, useEffect, useRef } from "react";
import Layout from "../../Layout";
import {
  useUploadProductFileMutation,
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetAllCoursesQuery,
  useGetProductsByCourseQuery,
  useUpdateProductMutation,
  useGetNumberOfProductsQuery,
} from "../../redux/queries/productApi";
import Badge from "../../components/Badge";
import { Box, Plus, Trash2, Edit, Upload, FileText, X } from "lucide-react";
import Loader from "../../components/Loader";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { texts } from "./translation";
import { Switch } from "@/components/ui/switch";

function ProductList() {
  const language = useSelector((state: any) => state.language.lang);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [isClosed, setIsClosed] = useState(false);
  const { data: numberOfProducts } = useGetNumberOfProductsQuery(undefined);

  // Fetch all courses
  const { data: courses, isLoading: loadingCourses } = useGetAllCoursesQuery(undefined);
  const [selectedCourse, setSelectedCourse] = useState<string>("");

  // ✅ Auto-select first course
  useEffect(() => {
    if (!loadingCourses && courses?.length > 0 && !selectedCourse) {
      setSelectedCourse(courses[0]?._id);
    }
  }, [courses, loadingCourses, selectedCourse]);

  // Fetch products by selected course
  const { data: products, isLoading: loadingProducts } = useGetProductsByCourseQuery({
    courseId: selectedCourse,
  });

  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [uploadProductFile, { isLoading: loadingUploadImage }] = useUploadProductFileMutation();
  const [createProduct, { isLoading: loadingCreateProduct }] = useCreateProductMutation();

  // ✅ form state
  const [name, setName] = useState<string>("");
  const [course, setCourse] = useState<string>("");
  const [type, setType] = useState<string>("");

  const resetForm = () => {
    setName("");
    setCourse("");
    setType("");
    setPdfFile(null);
    setIsClosed(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const iconFromUrl = (url?: string) => {
    const u = (url || "").toLowerCase();
    if (u.endsWith(".pdf")) return "/pdf.png";
    if (u.endsWith(".ppt") || u.endsWith(".pptx")) return "/powerpoint.png";
    return "/word.png";
  };

  const extFromFile = (file?: File | null) => {
    if (!file) return "";
    const name = file.name.toLowerCase();
    if (name.endsWith(".pdf")) return "PDF";
    if (name.endsWith(".pptx")) return "PPTX";
    if (name.endsWith(".ppt")) return "PPT";
    if (name.endsWith(".docx")) return "DOCX";
    if (name.endsWith(".doc")) return "DOC";
    return "FILE";
  };

  const sizeLabel = (size?: number) => {
    if (!size) return "—";
    return size < 1024 * 1024
      ? `${(size / 1024).toFixed(2)} KB`
      : `${(size / 1024 / 1024).toFixed(2)} MB`;
  };

  // ✅ Smart defaults when opening create modal: pre-fill course + try infer name/type from file
  const openCreateModal = () => {
    resetForm();
    setCourse(selectedCourse || "");
    setType("Note"); // default
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setName(product.name);
    setCourse(product.course);
    setType(product.type);
    setIsClosed(Boolean(product.isClosed));
    setPdfFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsEditModalOpen(true);
  };

  // ✅ quick add: drag/drop
  const [dragOver, setDragOver] = useState(false);

  const handlePickFile = (file: File | null) => {
    if (!file) return;

    const allowed = [".pdf", ".doc", ".docx", ".ppt", ".pptx"];
    const lower = file.name.toLowerCase();
    const ok = allowed.some((e) => lower.endsWith(e));
    if (!ok) {
      toast.error("Allowed: PDF, DOC/DOCX, PPT/PPTX");
      return;
    }

    setPdfFile(file);

    // infer name from file (without extension) ONLY if name empty
    const base = file.name.replace(/\.[^/.]+$/, "");
    setName((prev) => (prev?.trim() ? prev : base));

    // infer type from filename keywords (simple)
    const t = lower.includes("exam")
      ? "Exam"
      : lower.includes("assignment") || lower.includes("hw")
      ? "Assignment"
      : lower.includes("syllabus")
      ? "Syllabus"
      : lower.includes("report")
      ? "Report"
      : lower.includes("book")
      ? "Book"
      : "Note";
    setType((prev) => (prev ? prev : t));
  };

  const handleCreateProduct = async () => {
    // ✅ super clear validation
    if (!course) return toast.error("Please select a course");
    if (!pdfFile) return toast.error("Please upload a file");
    if (!name.trim()) return toast.error("Please enter a name");
    if (!type) return toast.error("Please select a type");

    let uploadedFile: { url: string; publicId: string; size: number } | null = null;

    // Upload file
    try {
      const formData = new FormData();
      formData.append("file", pdfFile);

      const res = await uploadProductFile({ formData, course }).unwrap();

      uploadedFile = {
        url: res.file.fileUrl,
        publicId: res.file.publicId,
        size: pdfFile.size,
      };
    } catch (error: any) {
      toast.error(error?.data?.message || error?.error || "File upload failed");
      return;
    }

    // Create
    try {
      await createProduct({
        name: name.trim(),
        course,
        type,
        file: uploadedFile,
      }).unwrap();

      toast.success("Resource added ✅");
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create product");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const ok = window.confirm(language === "ar" ? "متأكد تبي تحذف؟" : "Delete this resource?");
    if (!ok) return;

    try {
      await deleteProduct(productId).unwrap();
      toast.success(language === "ar" ? "تم حذف المنتج بنجاح" : "Product deleted successfully");
    } catch {
      toast.error(language === "ar" ? "فشل حذف المنتج" : "Failed to delete product");
    }
  };

  const handleUpdateProduct = async () => {
    try {
      await updateProduct({
        _id: editingProduct._id,
        isClosed,
        name: name.trim(),
        course,
        type,
      }).unwrap();

      toast.success(language === "ar" ? "تم تعديل المنتج بنجاح" : "Product updated successfully");
      setIsEditModalOpen(false);
      setEditingProduct(null);
      resetForm();
    } catch {
      toast.error(language === "ar" ? "فشل تعديل المنتج" : "Failed to update product");
    }
  };

  return (
    <Layout>
      {loadingProducts || loadingCourses ? (
        <Loader />
      ) : (
        <div className="px-2 flex lg:w-4xl flex-col w-full min-h-screen lg:min-h-auto py-3 mt-[70px]">
          {/* Header */}
          <div className="w-full">
            <div className="flex justify-between items-center flex-wrap gap-3" dir="rtl">
              <h1
                dir={language === "ar" ? "rtl" : "ltr"}
                className="text-lg lg:text-2xl font-black flex gap-2 lg:gap-5 items-center flex-wrap">
                {texts[language].products}:
                <Badge icon={false} className="p-1">
                  <Box className="size-5" strokeWidth={1} />
                  <p className="text-lg lg:text-lg">{numberOfProducts || 0}</p>
                </Badge>
              </h1>

              {/* ✅ same button style, but easier (auto-fill) */}
              <button
                onClick={openCreateModal}
                className="bg-black text-white font-bold flex items-center gap-1 text-sm lg:text-md shadow-md px-3 py-2 rounded-md hover:bg-black/70 transition">
                {texts[language].addProduct}
                <Plus />
              </button>
            </div>

            <Separator className="my-4 bg-black/20" />

            {/* Course Filters */}
            <div className="mb-5 flex items-center gap-3 flex-wrap">
              <select
                value={selectedCourse || ""}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full sm:w-60 px-4 py-2 border rounded-lg bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-black focus:border-black outline-none">
                <option value="" disabled>
                  Select a course
                </option>
                {courses?.map((c: any) => (
                  <option
                    key={c._id}
                    value={c._id}
                    className={`${c.isClosed && "text-rose-500"} ${c.isPaid && "text-blue-500"}`}>
                    {c.code} {c.isPaid ? "(paid)" : ""} {c.isClosed ? "(closed)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Table */}
            <div className="rounded-lg border p-3 lg:p-5 bg-white overflow-x-auto">
              <table className="w-full lg:min-w-[700px] rounded-lg border-gray-200 text-sm text-left text-gray-700">
                <thead className="bg-white text-gray-900/50 font-semibold">
                  <tr>
                    <th className="pb-2 border-b ">{texts[language].name}</th>
                    <th className="pb-2 border-b ">{texts[language].type}</th>
                    <th className="pb-2 border-b ">{texts[language].size}</th>
                    <th className="pb-2 border-b ">{texts[language].actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {products?.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center p-5 text-gray-400">
                        {texts[language].noProductsFound}
                      </td>
                    </tr>
                  ) : (
                    products?.map((p: any) => (
                      <tr key={p._id}>
                        <td className="py-2 flex items-center gap-2 font-semibold">
                          <img
                            src={iconFromUrl(p.file?.url)}
                            className="size-10 object-cover rounded-md"
                            alt="file"
                          />
                          {p.name}
                        </td>
                        <td className="font-semibold text-gray-400">{p.type}</td>
                        <td className="font-semibold">
                          {p?.size ? (
                            <span className="text-xs text-gray-400 block">{sizeLabel(p.size)}</span>
                          ) : (
                            <span className="text-xs text-gray-300 block">—</span>
                          )}
                        </td>
                        <td className="py-2 flex gap-2">
                          <button
                            disabled={deleting}
                            onClick={() => handleDeleteProduct(p._id)}
                            className="text-black hover:bg-zinc-200 bg-zinc-100 p-2 rounded-md text-sm disabled:opacity-60">
                            <Trash2 className="size-4 sm:size-5" />
                          </button>
                          <button
                            onClick={() => openEditModal(p)}
                            className="text-black hover:bg-zinc-200 bg-zinc-100 p-2 rounded-md text-sm">
                            <Edit className="size-4 sm:size-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================= Create Product Modal (EASIER) ========================= */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="flex flex-col">
          <DialogHeader>
            <DialogTitle>{texts[language].addProduct}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto mt-4 space-y-4">
            {/* ✅ Step 1: choose course first (prefilled) */}
            <div className="space-y-1">
              <div className="text-xs font-bold text-gray-500">
                {language === "ar" ? "1) اختر المادة" : "1) Select course"}
              </div>

              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="p-2 w-full border rounded-md">
                <option value="" disabled>
                  {texts[language].selectCategory}
                </option>
                {loadingCourses ? (
                  <option>Loading...</option>
                ) : (
                  courses?.map((c: any) => (
                    <option key={c._id} value={c._id}>
                      {c.code}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* ✅ Step 2: drag drop upload (same look, just more functional) */}
            <div className="space-y-1">
              <div className="text-xs font-bold text-gray-500">
                {language === "ar" ? "2) ارفع الملف" : "2) Upload file"}
              </div>

              <div
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOver(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOver(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  handlePickFile(file || null);
                }}
                className={`w-full rounded-md border p-3 transition ${
                  dragOver ? "bg-zinc-50 border-black" : "bg-white"
                }`}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Upload className="size-4 text-gray-500" />
                    <p className="text-sm font-semibold text-gray-700">
                      {language === "ar"
                        ? "اسحب الملف هنا أو اضغط للاختيار"
                        : "Drag file here or click to choose"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-zinc-100 hover:bg-zinc-200 transition px-3 py-2 rounded-md text-sm font-bold">
                    {language === "ar" ? "اختيار ملف" : "Choose file"}
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  onChange={(e) => handlePickFile(e.target.files?.[0] || null)}
                  className="hidden"
                />

                {/* ✅ file preview */}
                {pdfFile && (
                  <div className="mt-3 flex items-center justify-between gap-3 border rounded-md p-2 bg-white">
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={iconFromUrl(pdfFile.name)}
                        className="size-8 rounded-md"
                        alt="file"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{pdfFile.name}</p>
                        <p className="text-xs text-gray-400 font-semibold">
                          {extFromFile(pdfFile)} • {sizeLabel(pdfFile.size)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setPdfFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="p-2 rounded-md bg-zinc-100 hover:bg-zinc-200 transition"
                      aria-label="remove file">
                      <X className="size-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ✅ Step 3: details (auto-filled from filename) */}
            <div className="space-y-1">
              <div className="text-xs font-bold text-gray-500">
                {language === "ar" ? "3) التفاصيل" : "3) Details"}
              </div>

              <input
                type="text"
                placeholder={texts[language].productName}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-2 w-full border rounded-md"
              />

              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="p-2 w-full border rounded-md">
                <option value="" disabled>
                  {texts[language].selectType}
                </option>
                <option value="Note">Note</option>
                <option value="Book">Book</option>
                <option value="Exam">Exam</option>
                <option value="Assignment">Assignment</option>
                <option value="Report">Report</option>
                <option value="Syllabus">Syllabus</option>
              </select>

              {/* ✅ micro helper */}
              <div className="text-xs text-gray-400 font-semibold flex items-center gap-2">
                <FileText className="size-4" />
                {language === "ar"
                  ? "الاسم والنوع يتعبّون تلقائياً من اسم الملف (تقدر تعدّلهم)."
                  : "Name/type auto-filled from filename (you can edit)."}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}>
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>

            <Button
              variant="default"
              disabled={loadingCreateProduct || loadingUploadImage}
              onClick={handleCreateProduct}>
              {loadingUploadImage
                ? texts[language].uploading
                : loadingCreateProduct
                ? texts[language].creating
                : texts[language].create}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================ Update Product Modal (same) ============================ */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="flex flex-col">
          <DialogHeader>
            <DialogTitle>{texts[language].editProduct}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto mt-4 space-y-4">
            <div className="flex items-center gap-2">
              <label htmlFor="">{language === "ar" ? "مغلق" : "Closed"}</label>
              <Switch checked={isClosed} onCheckedChange={setIsClosed} />
            </div>

            <input
              type="text"
              placeholder={texts[language].productName}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-2 w-full border rounded-md"
            />

            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="p-2 w-full border rounded-md">
              <option value="" disabled>
                {texts[language].selectCategory}
              </option>
              {courses?.map((c: any) => (
                <option key={c._id} value={c._id}>
                  {c.code}
                </option>
              ))}
            </select>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="p-2 w-full border rounded-md">
              <option value="" disabled>
                {texts[language].selectType}
              </option>
              <option value="Note">Note</option>
              <option value="Book">Book</option>
              <option value="Exam">Exam</option>
              <option value="Assignment">Assignment</option>
              <option value="Report">Report</option>
              <option value="Syllabus">Syllabus</option>
            </select>
          </div>

          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button
              variant="default"
              disabled={loadingUploadImage || updating}
              onClick={handleUpdateProduct}>
              {loadingUploadImage || updating ? texts[language].uploading : texts[language].update}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

export default ProductList;
