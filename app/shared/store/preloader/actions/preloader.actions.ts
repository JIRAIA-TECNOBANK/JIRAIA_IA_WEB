import { createAction, props } from "@ngrx/store";

export const showPreloader = createAction('[Preloader] show preloader', props<{ payload: string}>());
export const closePreloader = createAction('[Preloader] close preloader');