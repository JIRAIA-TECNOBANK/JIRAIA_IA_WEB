import { createReducer, on } from "@ngrx/store"
import { PreloaderActions } from "./actions"

export interface IPreloaderState {
    message: string,
    show: boolean,
    cssDisplay: string
}

const initializeState: IPreloaderState = {
    message: '',
    show: false,
    cssDisplay: 'd-none'
}

export const preloaderReducer = createReducer<IPreloaderState>(
    initializeState,
    on(PreloaderActions.showPreloader, (state, action): IPreloaderState => {
        return {
            ...state,
            message: action.payload,
            show: true,
            cssDisplay: 'd-display'
        }
    }),
    on(PreloaderActions.closePreloader, (state)=> {
        return {
            ...state,
            message: '',
            show: false,
            cssDisplay: 'd-none'
        }
    })
)