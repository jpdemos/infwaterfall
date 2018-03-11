import { LocationProvider } from "../providers/location";

import * as Modules from "../modules/";
import { STAGE } from "../providers";

// Manage the extension modules states.
export const ModulesManager = 
{
	async ExecuteModulesStage( stage )
	{
		Promise.all(
			this.PageModules
			.filter( module => module[ stage ] )
			.map( async module => await this.ExecuteModuleStage( module, stage ) )
		);
	},

	async ExecuteModuleStage( module, stage )
	{
		if( typeof module == "string" )
			module = Modules[ module ];
		
		await module[ stage ]();
		module[ STAGE.STATE ] = stage;
	},

	IsModuleUsable( name )
	{
		return Modules[ name ].USE_ON && Modules[ name ].USE_ON.includes( LocationProvider.PageType );
	},

	get PageModules()
	{
		if( !!this.CachedPageModules )
			return this.CachedPageModules;
		
		this.CachedPageModules = [];

		for( const name in Modules )
			if( this.IsModuleUsable( name ) )
			this.CachedPageModules.push( Modules[ name ] );
		
		return this.CachedPageModules;
	},

	IsModuleActivated( name )
	{
		return Modules[ name ][ STAGE.STATE ] && Modules[ name ][ STAGE.STATE ] == STAGE.RUN;
	},

	ActivateModule( name )
	{
		!this.IsModuleActivated( name ) && ExecuteModuleStage( name, STAGE.INIT ) && ExecuteModuleStage( name, STAGE.RUN );
	},

	DisableModule( name )
	{
		this.IsModuleActivated( name ) && ExecuteModuleStage( name, STAGE.DESTROY );
	}
}