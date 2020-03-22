import React from "react";

const employeesUrlByManagerId = managerId =>
  "https://2jdg5klzl0.execute-api.us-west-1.amazonaws.com/default/EmployeesChart-Api?manager=" +
  managerId;

const initialState = {
  rootId: null,
  people: {},
  structure: {}
};

function dispatchMiddleware(dispatch) {
  return async action => {
    switch (action.type) {
      case "LOAD_ROOT": {
        const response = await fetch(employeesUrlByManagerId(0));
        const updatedAction = {
          ...action,
          payload: {
            root: (await response.json())[0]
          }
        };
        dispatch(updatedAction);
        break;
      }
      case "LOAD_EMPLOYEES_BY_MANAGER": {
        const response = await fetch(
          employeesUrlByManagerId(action.payload.managerId)
        );
        const updatedAction = {
          ...action,
          payload: {
            managerId: action.payload.managerId,
            employees: await response.json()
          }
        };
        dispatch(updatedAction);
        break;
      }
      default:
        return dispatch(action);
    }
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "LOAD_ROOT":
      return {
        rootId: action.payload.root.id,
        people: {
          [action.payload.root.id]: action.payload.root
        },
        structure: { [action.payload.root.id]: null }
      };
    case "LOAD_EMPLOYEES_BY_MANAGER":
      return {
        rootId: state.rootId,
        people: {
          ...state.people,
          ...action.payload.employees.reduce((obj, employee) => {
            obj[employee.id] = employee;
            return obj;
          }, {})
        },
        structure: {
          ...state.structure,
          ...{
            [action.payload.managerId]: action.payload.employees.map(
              employee => employee.id
            )
          }
        }
      };
    default:
      throw new Error();
  }
}

export default function useOrgReducer() {
  const [state, stateDispatch] = React.useReducer(reducer, initialState);
  const dispatch = React.useCallback(dispatchMiddleware(stateDispatch), []);

  React.useEffect(() => {
    dispatch({ type: "LOAD_ROOT" });
  }, [dispatch]);

  return [state, dispatch];
}
