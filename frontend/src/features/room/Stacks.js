import React from "react";
import styled from "@emotion/styled";
import { Droppable, Draggable } from "react-beautiful-dnd";
import StackView from "./StackView";
import CardBack from "./CardBack"
import { ContextMenu, MenuItem, SubMenu, ContextMenuTrigger } from "react-contextmenu";

export const getBackgroundColor = (isDraggingOver, isDraggingFrom) => {
  if (isDraggingOver) {
    return 'hotpink';
  }
  if (isDraggingFrom) {
    return '';
  }
  return 'lime';
};

const Wrapper = styled.div`
  background-color: ${props => props.isDraggingOver ? "rgba(1,1,1,0.4)" : ""};
  padding: 0 0 0 0;
  height: 87%;
  user-select: none;
  overflow-x: ${props => (props.type=="deck" || props.type=="discard") ? "none" : "auto"};
  overflow-y: ${props => (props.type=="deck" || props.type=="discard") ? "hidden" : "none"};
  max-height: 87%;
`;

const DropZone = styled.div`
  /* stop the list collapsing when empty */
  display: ${props => (props.group.type=="deck" || props.group.type=="discard") ? "" : "flex"};
  width: 100%;
  height: 100%;
  min-height: 100%;
  padding: 0 0 0 0.75vw;
`;

const MenuContainer = styled.div`
    background: red;
    cursor: default;
`;

// const CardBack = styled.div`
//   /* stop the list collapsing when empty */
//   display: ${props => (props.type=="deck" || props.type=="discard") ? "" : "none"};
//   width: ${CARDSCALE}vw;
//   height: ${CARDSCALE/0.72}vw;
//   border-width: 0px;
//   border-color: black;
//   position: absolute;
//   margin: 0 0 0 0.75vw;
//   background: ${props => ((props.type=="deck" || props.type=="discard") && (props.group.stacks.length>1 || (props.group.stacks.length===1 && props.isDraggingOver && !props.isDraggingFrom))) ? 
//                               (props.type=="deck" ? `url(${playerBackURL})`: `url(${props.group.stacks[0].cards[0].src})`) : ""}; 
//   background-size: contain;
// `;

/* stylelint-disable block-no-empty */
const Container = styled.div`
  height: 100%;
`;
/* stylelint-enable */

const InnerQuoteList = React.memo(function InnerQuoteList(props) {
  const pile = (props.group.type=="deck" || props.group.type=="discard")

  // Truncate stacked piles
  var stacks;
  if (pile && props.isDraggingOver && !props.isDraggingFrom) stacks = [];
  else if (pile && props.stacks.length>1) stacks = [props.stacks[0]]
  else stacks = props.stacks;

  return stacks?.map((stack, stackIndex) => (

        <Draggable 
          key={stack.id} 
          draggableId={stack.id} 
          index={stackIndex}
        >
          {(dragProvided, dragSnapshot) => (
            <StackView
              broadcast={props.broadcast}
              group={props.group}
              stackIndex={stackIndex}
              stack={stack}
              key={stack.id}
              isDragging={dragSnapshot.isDragging}
              isGroupedOver={Boolean(dragSnapshot.combineTargetFor)}
              provided={dragProvided}
            />
          )}
        </Draggable>

  ));
});

function InnerList(props) {
  const { isDraggingOver, isDraggingFrom, broadcast, group, stacks, dropProvided } = props;

  return (
    <Container>
      <CardBack group={group} isDraggingOver={isDraggingOver} isDraggingFrom={isDraggingFrom}></CardBack>
      <DropZone ref={dropProvided.innerRef} group={group}>
        <InnerQuoteList 
          isDraggingOver={isDraggingOver}
          isDraggingFrom={isDraggingFrom}
          broadcast={broadcast} 
          group={group} 
          stacks={stacks}
        />
        {dropProvided.placeholder}
      </DropZone>
    </Container>
  );
}

export default function Stacks(props) {
  const {
    broadcast,
    group,
    isDropDisabled,
    isCombineEnabled,
  } = props;

  return (
    <Droppable
      droppableId={group.id}
      key={group.id}
      isDropDisabled={isDropDisabled}
      isCombineEnabled={isCombineEnabled}
      direction={group.type=="deck" || group.type=="discard" ? "vertical" : "horizontal"}
    >
      {(dropProvided, dropSnapshot) => (
        <Wrapper
          isDraggingOver={dropSnapshot.isDraggingOver}
          isDropDisabled={isDropDisabled}
          isDraggingFrom={Boolean(dropSnapshot.draggingFromThisWith)}
          {...dropProvided.droppableProps}
          type={group.type}
        >
            <InnerList
                isDraggingOver={dropSnapshot.isDraggingOver}
                isDraggingFrom={Boolean(dropSnapshot.draggingFromThisWith)}
                broadcast={broadcast}
                group={group}
                stacks={group.stacks}
                dropProvided={dropProvided}
            />
        </Wrapper>
      )}
    </Droppable>
  );
}
