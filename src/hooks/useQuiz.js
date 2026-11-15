import { useReducer } from 'react';

const init = (questions) => ({ queue: questions, index: 0, picked: null, score: 0, missed: [], done: false, round: 1 });

function reducer(state, action) {
  switch (action.type) {
    case 'pick': {
      if (state.picked !== null) return state; // answers are final
      const q = state.queue[state.index];
      const right = action.index === q.answerIndex;
      return { ...state, picked: action.index, score: state.score + (right ? 1 : 0), missed: right ? state.missed : [...state.missed, q] };
    }
    case 'next': {
      if (state.picked === null) return state;
      return state.index + 1 >= state.queue.length
        ? { ...state, done: true }
        : { ...state, index: state.index + 1, picked: null };
    }
    case 'retake': // re-test only what was missed
      return { ...init(state.missed), round: state.round + 1 };
    case 'restart':
      return init(action.questions);
    default:
      return state;
  }
}

export function useQuiz(questions) {
  const [state, dispatch] = useReducer(reducer, questions, init);
  return {
    state,
    pick: (index) => dispatch({ type: 'pick', index }),
    next: () => dispatch({ type: 'next' }),
    retake: () => dispatch({ type: 'retake' }),
    restart: () => dispatch({ type: 'restart', questions }),
  };
}
