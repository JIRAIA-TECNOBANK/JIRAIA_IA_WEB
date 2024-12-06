import { createAction, createReducer, on } from "@ngrx/store"
import { InfoLoadingActions } from "./actions"

export interface IInfoLoadingState {
    message: string;
    show: boolean;
}

const initializeState: IInfoLoadingState = {
    message: '',
    show: false
}

export const infoLoadingReducer = createReducer<IInfoLoadingState>(
    initializeState,
    on(InfoLoadingActions.startInfoLoading, (state, action): IInfoLoadingState => {
        return {
            ...state,
            message: action.payload,
            show: true
        }
    }),
    on(InfoLoadingActions.stopInfoLoading, (state) => {
        return {
            ...state,
            message: '',
            show: false
        }
    })
)