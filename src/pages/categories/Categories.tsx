import { useEffect, useState } from "react";
import Layout from "../../Layout";
import {
  useCreateCourseMutation,
  useDeleteCourseMutation,
  useGetCoursesQuery,
  useUploadCourseImageMutation,
  useUpdateCourseMutation,
} from "../../redux/queries/productApi";
import { toast } from "react-toastify";
import Badge from "../../components/Badge";
import Loader from "../../components/Loader";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Boxes, Search, Loader2Icon, SquarePen, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { clsx } from "clsx";
import { useSelector } from "react-redux";
import Paginate from "@/components/Paginate";
import { Switch } from "@/components/ui/switch";

function Categories() {
  const [uploadCategoryImage] = useUploadCourseImageMutation();
  const language = useSelector((state: any) => state.language.lang);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [courseName, setCourseName] = useState("");
  const [courseBadge, setCourseBadge] = useState("");
  const [course, setCourse] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();
  const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation();

  const {
    data,
    isLoading: isLoadingCategories,
    refetch,
  } = useGetCoursesQuery({
    pageNumber: page || 1,
    keyword: searchTerm || "",
  });

  const categories = data?.courses || [];
  const pages = data?.pages || 1;
  console.log(categories);

  const labels: any = {
    en: {
      categories: "Courses",
      resources: "Resources",
      status: "Status",
      totalCategories: "courses",
      addCategory: "Add new Course",
      searchPlaceholder: "Search courses...",
      allCategories: "All",
      mainCategories: "Main",
      subCategories: "Sub",
      tableName: "Code",
      tableParent: "Parent",
      tableActions: "Actions",
      noCategoriesFound: "No courses found.",
      enterCategoryName: "Enter course name",
      enterCategoryCode: "Enter course code",
      cancel: "Cancel",
      create: "Create",
      creating: "Creating...",
      badge: "Enter course badge",
    },
    ar: {
      categories: "المواد",
      badge: "شعار",
      status: "الحاله",
      resources: "الموارد",
      totalCategories: "ماده",
      addCategory: "إضافة ماده جديدة",
      searchPlaceholder: "ابحث عن ماده...",
      allCategories: "الكل",
      mainCategories: "رئيسية",
      subCategories: "فرعية",
      tableName: "الماده",
      tableParent: "الرئيسية",
      tableActions: "الاجراءات",
      noCategoriesFound: "لم يتم العثور على أي ماده.",
      enterCategoryName: "أدخل اسم الماده",
      enterCategoryCode: "أدخل رمز الماده",
      cancel: "إلغاء",
      create: "إنشاء",
      creating: "جارٍ الإنشاء...",
    },
  };
  const t = labels[language];

  // ─── Create Category ───────────────────────────────────────────
  const handleCreateCategory = async () => {
    if (!course.trim()) {
      toast.error(t.enterCategoryName);
      return;
    }

    let uploadedImageUrl = null;
    if (imageFile) {
      try {
        const formData = new FormData();
        formData.append("image", imageFile);
        const res = await uploadCategoryImage(formData).unwrap();
        uploadedImageUrl = res.image.imageUrl;
      } catch (error: any) {
        toast.error(error?.data?.message || error?.error);
        return;
      }
    }

    try {
      await createCourse({
        name: courseName,
        code: course,
        image: uploadedImageUrl,
      }).unwrap();

      toast.success("Course created successfully.");
      setCourse("");
      setImageFile(null);
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      toast.error("Course already exists or failed to create.");
    }
  };

  // ─── Delete Category ───────────────────────────────────────────
  const handleDeleteCategory = async (id: string) => {
    setDeletingCategoryId(id);
    try {
      await deleteCourse(id).unwrap();
      toast.success("Course deleted successfully.");
      refetch();
    } catch {
      toast.error("Error deleting course");
    } finally {
      setDeletingCategoryId(null);
    }
  };

  // ─── Update Category ───────────────────────────────────────────
  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    let uploadedImageUrl = editingCategory?.image || null;

    if (imageFile) {
      try {
        const formData = new FormData();
        formData.append("image", imageFile);
        const res = await uploadCategoryImage(formData).unwrap();
        uploadedImageUrl = res.image.imageUrl;
      } catch (error: any) {
        toast.error(error?.data?.message || error?.error);
        return;
      }
    }

    try {
      await updateCourse({
        id: editingCategory._id,
        name: courseName,
        code: course,
        badge: courseBadge,
        image: uploadedImageUrl,
        isFeatured,
        isClosed,
        isPaid,
      }).unwrap();

      toast.success("Course updated successfully!");
      setCourse("");
      setImageFile(null);
      setEditingCategory(null);
      setIsEditModalOpen(false);
      refetch();
    } catch {
      toast.error("Failed to update course");
    }
  };

  useEffect(() => {
    if (isModalOpen) setTimeout(() => document.querySelector("input")?.focus(), 100);
  }, [isModalOpen]);

  const showLock = (course: any) => {
    if (course) {
      if (course.isClosed || course.isPaid) {
        return <Lock className="size-4" />;
      }
    }
  };
  return (
    <Layout>
      {isLoadingCategories ? (
        <Loader />
      ) : (
        <div className="px-2 mb-10 py-3 mt-[70px] lg:mt-[50px] w-full lg:max-w-4xl min-h-screen">
          {/* Header */}
          <div
            className={`flex justify-between items-center ${
              language === "ar" ? "flex-row-reverse" : ""
            }`}>
            <h1
              dir={language === "ar" ? "rtl" : "ltr"}
              className="text-lg lg:text-2xl font-black flex gap-2 lg:gap-5 items-center">
              {t.categories}:
              <Badge icon={false} className="p-1">
                <Boxes className="size-5" strokeWidth={1} />
                <p className="text-lg lg:text-lg">{data?.total || 0}</p>
              </Badge>
            </h1>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-black hover:bg-black/70 text-white font-bold flex items-center gap-1 text-sm lg:text-md shadow-md px-3 py-2 rounded-md transition-all duration-300">
              <Plus /> {t.addCategory}
            </button>
          </div>

          <Separator className="my-4 bg-black/20" />

          {/* Search + Filter */}
          <div className="flex   flex-row items-center gap-3 mb-5">
            <div className="relative w-full ">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Search className="h-5 w-5" />
              </span>
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border bg-white border-gray-300 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:border-2"
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-lg border p-3 sm:p-5 bg-white">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="bg-white text-gray-900/50 font-semibold">
                <tr>
                  <th className="pb-2 border-b">{t.tableName}</th>
                  <th className="pb-2 border-b">{t.status}</th>
                  <th className="pb-2 border-b">{t.resources}</th>
                  <th className="pb-2 border-b">{t.tableActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {categories?.length > 0 ? (
                  categories?.map((cat: any) => (
                    <tr key={cat._id} className="font-bold">
                      <td className="flex items-center gap-2 py-2">
                        {cat?.image ? (
                          <img
                            src={cat.image}
                            alt={cat.code}
                            className="size-10  object-cover rounded-md"
                          />
                        ) : (
                          <img
                            src="/placeholder.png"
                            className="size-10  border-2  object-cover rounded-md"
                          />
                        )}
                        <span className="flex items-center gap-1">
                          {cat.code} {showLock(cat)}
                        </span>
                      </td>
                      <td className="">
                        <span className="uppercase flex gap-1 items-center">
                          {cat.isClosed ? (
                            <span className="flex gap-1 items-center bg-rose-50 border border-rose-500 px-1 sm:px-2 py-1 rounded-full">
                              {/* <Lock className="size-3 text-rose-500" /> */}
                              <span className="text-xs text-rose-500 font-bold">Closed</span>
                            </span>
                          ) : cat.isPaid ? (
                            <span className="flex gap-1 items-center bg-orange-50 border border-orange-500 px-1 sm:px-2 py-1 rounded-full">
                              {/* <Lock className="size-3 text-blue-500" /> */}
                              <span className="text-xs text-orange-500 font-bold">Paid</span>
                            </span>
                          ) : (
                            <span className="text-xs text-teal-500 bg-teal-50 border-teal-500 border px-1 sm:px-2 py-1 rounded-full font-bold">
                              Open
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="">
                        <span className=" flex gap-1 items-center">
                          {cat?.resources?.length || 0}
                        </span>
                      </td>
                      <td className="">
                        <div className="flex gap-2">
                          <button
                            disabled={isDeleting && deletingCategoryId === cat._id}
                            onClick={() => handleDeleteCategory(cat._id)}
                            className="text-black hover:bg-zinc-200 bg-zinc-100 p-2 rounded-lg transition-all duration-300 flex items-center justify-center min-w-[32px] min-h-[32px]">
                            {isDeleting && deletingCategoryId === cat._id ? (
                              <Loader2Icon className="animate-spin" />
                            ) : (
                              <Trash2 className="size-4 sm:size-5" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setCourse(cat.code);
                              setIsEditModalOpen(true);
                            }}
                            className="text-black hover:bg-zinc-200 bg-zinc-100 p-2 rounded-lg transition-all duration-300 flex items-center justify-center min-w-[32px] min-h-[32px]">
                            <SquarePen className="size-4 sm:size-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                      {t.noCategoriesFound}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <Paginate page={page} pages={pages} setPage={setPage} />
          </div>
        </div>
      )}

      {/* ─── Create Modal ─────────────────────────────────────────── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.addCategory}</DialogTitle>
          </DialogHeader>

          <input
            type="text"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder={t.enterCategoryName}
            className={clsx(
              "w-full border bg-white border-gray-300 rounded-lg py-3 pl-4 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:border-2"
            )}
          />
          <input
            type="text"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            placeholder={t.enterCategoryCode}
            className={clsx(
              "w-full border bg-white border-gray-300 rounded-lg py-3 pl-4 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:border-2"
            )}
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && setImageFile(e.target.files[0])}
            className="p-4 w-full border rounded-md mb-2"
          />

          {imageFile && (
            <div className="mb-2 flex flex-col items-start gap-1">
              <p className="text-sm">Preview:</p>
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Preview"
                className="w-24 h-24 object-cover rounded-md border"
              />
            </div>
          )}

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {t.cancel}
            </Button>
            <Button variant="default" disabled={isCreating} onClick={handleCreateCategory}>
              {isCreating ? t.creating : t.create}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Edit Modal ─────────────────────────────────────────── */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
          </DialogHeader>

          <input
            type="text"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder={t.enterCategoryName}
            className={clsx(
              "w-full border bg-white border-gray-300 rounded-lg py-3 pl-4 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:border-2"
            )}
          />
          <input
            type="text"
            value={courseBadge}
            onChange={(e) => setCourseBadge(e.target.value)}
            placeholder={t.badge}
            className={clsx(
              "w-full border bg-white border-gray-300 rounded-lg py-3 pl-4 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:border-2"
            )}
          />
          <input
            type="text"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            placeholder={t.enterCategoryCode}
            className={clsx(
              "w-full border bg-white border-gray-300 rounded-lg py-3 pl-4 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:border-2"
            )}
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && setImageFile(e.target.files[0])}
            className="p-4 w-full border rounded-md mb-2"
          />

          {(editingCategory?.image || imageFile) && (
            <div className="mb-2 flex flex-col items-start gap-1">
              <p className="text-sm">Preview:</p>
              <img
                src={imageFile ? URL.createObjectURL(imageFile) : editingCategory?.image}
                alt="Preview"
                className="w-24 h-24 object-cover rounded-md border"
              />
            </div>
          )}
          <div className="grid grid-cols-3  items-center">
            <div className="flex items-center gap-2">
              <label htmlFor="">Featured</label>
              <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="">Closed</label>
              <Switch checked={isClosed} onCheckedChange={setIsClosed} />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="">Paid</label>
              <Switch checked={isPaid} onCheckedChange={setIsPaid} />
            </div>
          </div>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              {t.cancel}
            </Button>
            <Button variant="default" disabled={isUpdating} onClick={handleUpdateCategory}>
              {isUpdating ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

export default Categories;
