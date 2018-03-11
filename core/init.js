import "./styles/main.scss";

import { ObserverService, ConfigurationService } from "../services/";
import { LocationProvider, STAGE } from "../providers/";
import { /*ViewsManager,*/ ModulesManager, StylesManager } from "../managers/";

export const Extension =
{
	async Initialize()
	{
		LocationProvider.Initialize();
		ConfigurationService.Initialize();
		StylesManager.Initialize();
		ModulesManager.ExecuteModulesStage( STAGE.INIT );
		
		await ObserverService.AwaitEvent( document, "DOMContentLoaded" ); // whole html is parsed
		//ViewsManager.Initialize();
		ModulesManager.ExecuteModulesStage( STAGE.RUN );
	},

	/* async GetFile( filename )
	{
		// TODO. parceljs hash the filenames; we need to find how to get the hashes.
	},*/
}
