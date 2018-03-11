
// These are the execution stages enumerations
export const STAGE = {
	STATE: Symbol( "StageState" ),
	INIT: Symbol( "StageInitialization" ),
	RUN: Symbol( "StageRun" ),
	DESTROY: Symbol( "StageDestroy" ),

	PAUSED: Symbol( "StagePaused" )
}