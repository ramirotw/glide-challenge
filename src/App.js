import React from "react";
import "./App.css";
import useOrgReducer from "./useOrgReducer";

function employeesByManagerIdAction(dispatch, id) {
  return () =>
    dispatch({
      type: "LOAD_EMPLOYEES_BY_MANAGER",
      payload: { managerId: id }
    });
}

function Node(props) {
  const [expanded, setExpanded] = React.useState(false);
  const { id, peopleById, structure, loadChildren, dispatch } = props;
  const person = peopleById[id];
  const isLoaded = !!structure[id];
  const hasNoChildren = isLoaded && structure[id].length === 0;
  const hideExpandButton = isLoaded && hasNoChildren;
  const toggle = () => {
    if (!isLoaded) {
      loadChildren();
    }

    setExpanded(expanded => !expanded);
  };

  return (
    <div className="node">
      <div className="info">
        <button className={hideExpandButton ? "hidden" : ""} onClick={toggle}>
          {expanded ? "-" : "+"}
        </button>
        {person.first} {person.last}
      </div>
      {expanded && structure[id] ? (
        <div className="box">
          {structure[id].map(childId => (
            <Node
              {...props}
              id={childId}
              key={childId}
              loadChildren={employeesByManagerIdAction(dispatch, childId)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function App() {
  const [state, dispatch] = useOrgReducer();

  React.useEffect(() => {
    if (state.rootId) {
      dispatch({
        type: "LOAD_EMPLOYEES_BY_MANAGER",
        payload: { managerId: state.rootId }
      });
    }
  }, [dispatch, state.rootId]);

  return (
    <div className="App">
      {state.rootId ? (
        <Node
          id={state.rootId}
          peopleById={state.people}
          structure={state.structure}
          loadChildren={employeesByManagerIdAction(dispatch, state.rootId)}
          dispatch={dispatch}
        />
      ) : (
        "Loading..."
      )}
    </div>
  );
}

export default App;
