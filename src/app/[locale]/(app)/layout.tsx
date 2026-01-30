import { HeaderBalance } from "./_components/header-balance";

const MainLayout = async ({ params, children }: LayoutProps<"/[locale]">) => {
	return (
		<>
			<HeaderBalance />
			<div className="h-full p-5">{children}</div>
		</>
	);
};

export default MainLayout;
