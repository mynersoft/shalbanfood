import { Package, Phone, Shield, Truck } from "lucide-react";
import React from "react";

const TopBar = () => {
	return (
		<div className="hidden md:block bg-[#004488] text-white text-sm py-2 px-4">
			<div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<Phone size={14} />
						<span>Hotline: 01868944080</span>
					</div>
					<div className="hidden md:flex items-center gap-2">
						<Truck size={14} />
						<span>Free Shipping Over ৳2000</span>
					</div>
				</div>
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<Shield size={14} />
						<span>100% Secure Payment</span>
					</div>
					<div className="flex items-center gap-2">
						<Package size={14} />
						<span>Easy Returns</span>
					</div>

				</div>
			</div>
		</div>
	);
};

export default TopBar;
