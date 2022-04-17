import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import {Responsive,  WidthProvider } from "react-grid-layout";
import '../node_modules/react-grid-layout/css/styles.css'
import './style.css'
import uuid from "uuid/v4";

const ResponsiveGridLayout = WidthProvider(Responsive);

const itemsFromBackend = [
  { id: '1', title: "KPI 1",  size: 3},
  { id: '2', title: "KPI 2", size: 6 },
  { id: '3', title: "KPI 3", size: 4 },
  { id: '4', title: "KPI 4", size: 4 },
  { id: '5', title: "KPI 5", size: 12 }
];

class App extends React.Component {

  constructor() {
    super();
    this.state = {
      columns: {
        [uuid()]: {
          items: itemsFromBackend
        },
        [uuid()]: {
          name: "To do",
          description: "Create your todos.",
          items: [],
          inputable: false,
          textInputable: false
        }
      },
      layouts: itemsFromBackend.reduce((acc, item) => {
        acc[item.id] = {x: 0, y: 0, w: item.size, h: 1}
        return acc
      }, {}),
      saved: "",
      showPopup: false
    }
  }


  onDragEnd = (result, columns) => {
    if (!result.destination) return;
    const {source, destination} = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      let newColumns = JSON.parse(JSON.stringify(columns))
      newColumns = {
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems
        }
      }
      this.setState({
        columns: newColumns
      });
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      this.setState({
        ...columns,
        [source.droppableId]: {
          ...column,
          items: copiedItems
        }
      });
    }
  };

  onLayoutChange = (layout, layouts) => {

    let newLeyouts = {...this.state.layouts}

    layout.forEach((item, index) => {

      newLeyouts[item.i] = item

    })




    this.setState({
      layouts: newLeyouts
    }, () => {
      // console.log("leyouts -> callback = ", this.state.layouts)
    })

  };

  render() {
    const {columns, layouts, saved, showPopup} = this.state
    const coulumsArr = Object.entries(columns)
    const [firstColumnId, firstColumn] = coulumsArr[0]

    return (
        <div className={"builder-content"}>
          {showPopup && <div className={"popup-overlay"}>
            <div className={"popup-content"} >
              <p>
                {saved}
              </p>

              <div>
                <button onClick={() => {
                  this.setState({
                    showPopup: false
                  })
                }
                }>
                  Close
                </button>
              </div>
            </div>
          </div>}
          <DragDropContext
              onDragEnd={result => this.onDragEnd(result, columns)}
          >
            <div className={"left-section"} key={firstColumnId}>
              <div className={"section-content"}>
                <Droppable droppableId={firstColumnId} key={firstColumnId}>
                  {(provided, snapshot) => {
                    return (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={"dropable-item"}
                            style={{
                              background: snapshot.isDraggingOver
                                  ? "lightblue"
                                  : "lightgrey",
                            }}
                        >
                          {firstColumn.items.map((item, index) => {
                            return (
                                <Draggable
                                    key={item.id}
                                    draggableId={item.id}
                                    index={index}
                                >
                                  {(provided, snapshot) => {
                                    return (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={{
                                              userSelect: "none",
                                              padding: 16,
                                              margin: "0 0 8px 0",
                                              minHeight: "50px",
                                              backgroundColor: snapshot.isDragging
                                                  ? "#263B4A"
                                                  : "#456C86",
                                              color: "white",
                                              ...provided.draggableProps.style
                                            }}
                                        >
                                          {item.title}
                                        </div>
                                    );
                                  }}
                                </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                    );
                  }}
                </Droppable>
              </div>
            </div>
            <div className={"right-content"} >
              <button onClick={() => {
                let newColumns = JSON.parse(JSON.stringify(columns))
                newColumns[uuid()] = {
                  name: "",
                  description: "",
                  items: [],
                  inputable: true,
                  textInputable: true
                }
                this.setState({
                  columns: newColumns
                })
              }} >Add Section</button>
              {coulumsArr.slice(1).map(([columnId, column], index) => {
                return (
                    <div className={"added-section"} key={columnId}>
                      {column.inputable ? <input
                              placeholder={"Title"}
                              value={column.name}
                              onChange={(e) => {
                                let newColumns = JSON.parse(JSON.stringify(columns))
                                newColumns[columnId].name = e.target.value
                                this.setState({
                                  columns: newColumns
                                })
                              }}
                              onKeyDown={(e) => {
                                let newColumns = JSON.parse(JSON.stringify(columns))
                                newColumns[columnId].inputable = false
                                if (e.key === 'Enter' && newColumns[columnId].name !== "") {
                                  this.setState({
                                    columns: newColumns
                                  })
                                }
                              }}
                          /> :
                          <h2
                              onClick={() => {
                                let newColumns = JSON.parse(JSON.stringify(columns))
                                newColumns[columnId].inputable = true
                                this.setState({
                                  columns: newColumns
                                })

                              }}
                            className={"section-title"} >
                            {column.name}
                          </h2>}
                      <div className={"right-section-content"}>
                        <Droppable droppableId={columnId} key={columnId}>
                          {(provided, snapshot) => {
                            return (
                                <>
                                  <div
                                      {...provided.droppableProps}
                                      ref={provided.innerRef}
                                      style={{
                                        background: snapshot.isDraggingOver
                                            ? "lightblue"
                                            : "lightgrey",
                                        padding: 4,
                                        minHeight: 150
                                      }}
                                  >
                                    <ResponsiveGridLayout
                                        className="layout"
                                        // layouts={layouts}
                                        onLayoutChange={this.onLayoutChange}
                                        isResizable={false}
                                        // breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                                        // cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                                        onDragStart={this.onDrag}
                                    >
                                    {column.items.map((item, index) => {
                                      return (
                                          <div
                                              className={"dragged-item"}
                                              key={item.id}
                                              data-grid={{
                                                x: layouts[item.id].x,
                                                y: layouts[item.id].y,
                                                w: layouts[item.id].w,
                                                h: layouts[item.id].h
                                              }}
                                          >

                                            <Draggable
                                                key={item.id}
                                                draggableId={item.id}
                                                index={index}
                                            >
                                              {(provided, snapshot) => {

                                                return (
                                                    <>
                                                      <div
                                                          ref={provided.innerRef}
                                                          {...provided.draggableProps}
                                                          {...provided.dragHandleProps}
                                                          style={{
                                                        position: "absolute",
                                                        width: "100%",
                                                        height: "100%",
                                                        top: 0,
                                                        left: 0,
                                                        zIndex: 1,
                                                        ...provided.draggableProps.style
                                                      }}></div>
                                                      <div
                                                          ref={provided.innerRef}
                                                          {...provided.draggableProps}
                                                          {...provided.dragHandleProps}
                                                          style={{
                                                            userSelect: "none",
                                                            position: "absolute",
                                                            width: "100%",
                                                            height: "100%",
                                                            top: 0,
                                                            left: 0,
                                                            // padding: 16,
                                                            // margin: "0 0 8px 0",
                                                            // minHeight: "50px",
                                                            backgroundColor: snapshot.isDragging
                                                                ? "#263B4A"
                                                                : "#456C86",
                                                            color: "white",

                                                          }}
                                                      >
                                                        {item.title}
                                                        <p>Content</p>
                                                      </div>
                                                    </>

                                                );
                                              }}
                                            </Draggable>
                                          </div>
                                      );
                                    })}
                                    </ResponsiveGridLayout>
                                    {provided.placeholder}

                                  </div>

                                </>
                            );
                          }}
                        </Droppable>
                        {column.textInputable ? <input
                                placeholder={"Description"}
                                value={column.description}
                                className={"text-input"}

                                onChange={(e) => {
                                  let newColumns = JSON.parse(JSON.stringify(columns))
                                  newColumns[columnId].description = e.target.value
                                  this.setState({
                                    columns: newColumns
                                  })
                                }}
                                onKeyDown={(e) => {
                                  let newColumns = JSON.parse(JSON.stringify(columns))
                                  newColumns[columnId].textInputable = false
                                  if (e.key === 'Enter' && newColumns[columnId].description !== "") {
                                    this.setState({
                                      columns: newColumns
                                    })
                                  }
                                }} />
                                 :
                                <p
                                    onClick={() => {
                                      let newColumns = JSON.parse(JSON.stringify(columns))
                                      newColumns[columnId].textInputable = true
                                      this.setState({
                                        columns: newColumns
                                      })

                                    }}
                                    className={"text-desc"}>
                                  {column.description}
                                </p>}
                        <button
                            className={"remove-button"}
                            onClick={() => {
                              let newColumns = JSON.parse(JSON.stringify(columns))
                              if (newColumns[columnId].items.length > 0 ) {
                                alert("You can't delete section who has items.")
                                return
                              }

                              delete newColumns[columnId]
                              this.setState({columns: newColumns})
                            }}
                        >
                          Remove
                        </button>
                      </div>

                    </div>
                );
              })}
              <div className={"footer-content"}>
                <button
                    className={"save-button"}
                    onClick={() => {

                      const arr = coulumsArr.slice(1).reduce((acc, [itemId, item]) => {
                          const obj = {}
                          obj.name = item.name
                          obj.description = item.description
                          obj.items = item.items.map((el, index) => {
                            el.x = layouts[el.id].x
                            el.y = layouts[el.id].y
                            return el
                          }).sort((a, b) => {
                            if (Number(a.id) < Number(b.id)) {
                              return -1
                            }

                            if (Number(a.id) > Number(b.id)) {
                              return 1
                            }

                            return 0
                          })
                          acc.push(obj)
                          return acc
                      }, [])
                      const arrStr = JSON.stringify(arr)
                      this.setState({
                        saved: arrStr,
                        showPopup: true
                      })
                      // console.log(arrStr)
                      // console.log("coulumsArr -> ", coulumsArr.slice(1))
                    }}
                >Save</button>
              </div>
            </div>
          </DragDropContext>
        </div>
    );
  }
}

export default App;
