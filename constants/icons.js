import { Package, CheckCircle, Clock, XCircle, Truck } from 'lucide-react';





export const STATUS_ICON = {
	pending: Clock,
	processing: Package,
	shipped: Truck,
	delivered: CheckCircle,
	cancelled: XCircle,
};
