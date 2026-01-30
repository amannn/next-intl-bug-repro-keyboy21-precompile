import { getTranslations } from "next-intl/server";

export const HeaderBalance = async () => {
  const t = await getTranslations("HomePage");

  return (
    <div className="flex-row items-center rounded-xl border border-gray-300 text-black">
      <span className="px-4">
        {t("header.balance", { balance: "123123" })}
      </span>
    </div>
  );
};