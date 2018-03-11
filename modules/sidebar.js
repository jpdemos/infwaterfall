import { PAGE_TYPE } from "../providers/location";
import { STAGE } from "../providers";

// Toggle the page's sidebar.
export const SidebarModule = 
{
	USE_ON: [ PAGE_TYPE.FRONTPAGE, PAGE_TYPE.SUB ],

	Configuration: {},

	[ STAGE.RUN ]()
	{
		// This module is TODO.
	},

	[ STAGE.DESTROY ]()
	{
		
	}
}