import { createAction, props } from "@ngrx/store";

export const startInfoLoading = createAction('[Info Loading] create notification', props<{ payload: string }>());
export const stopInfoLoading = createAction('[Info Loading] close notification');