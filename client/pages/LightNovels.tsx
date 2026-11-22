import SeriesLibrary from "@/components/SeriesLibrary";

export default function LightNovels() {
  return (
    <SeriesLibrary
      series={["Sword Art Online", "Sword Art Online Progressive"]}
      theme="blue"
      title="الروايات الخفيفة"
      subtitle="كل مجلدات ساو وبروجرسيف المتاحة"
    />
  );
}
