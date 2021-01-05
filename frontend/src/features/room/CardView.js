import React, { useState, useEffect, useRef, Component } from "react";
import { TokensView } from './TokensView';
import GameUIContext from "../../contexts/GameUIContext";
import { useActiveCard, useSetActiveCard } from "../../contexts/ActiveCardContext";
import { playerBackSRC, encounterBackSRC } from "./Constants"
import { getCardBackSRC } from "./CardBack"
import { CARDSCALE } from "./Constants"
import styled from "@emotion/styled";
import { ContextMenu, MenuItem, SubMenu, ContextMenuTrigger } from "react-contextmenu";

//import cx from "classnames";




// PREVENT DOUBLECLICK REGISTERING 2 CLICK EVENTS
export const delay = n => new Promise(resolve => setTimeout(resolve, n));

export const cancellablePromise = promise => {
    let isCanceled = false;
  
    const wrappedPromise = new Promise((resolve, reject) => {
      promise.then(
        value => (isCanceled ? reject({ isCanceled, value }) : resolve(value)),
        error => reject({ isCanceled, error }),
      );
    });
  
    return {
      promise: wrappedPromise,
      cancel: () => (isCanceled = true),
    };
};

const useCancellablePromises = () => {
  const pendingPromises = useRef([]);

  const appendPendingPromise = promise =>
    pendingPromises.current = [...pendingPromises.current, promise];

  const removePendingPromise = promise =>
    pendingPromises.current = pendingPromises.current.filter(p => p !== promise);

  const clearPendingPromises = () => pendingPromises.current.map(p => p.cancel());

  const api = {
    appendPendingPromise,
    removePendingPromise,
    clearPendingPromises,
  };

  return api;
};

const useClickPreventionOnDoubleClick = (onClick, onDoubleClick) => {
    const api = useCancellablePromises();
  
    const handleClick = () => {
      api.clearPendingPromises();
      const waitForClick = cancellablePromise(delay(300));
      api.appendPendingPromise(waitForClick);
  
      return waitForClick.promise
        .then(() => {
          api.removePendingPromise(waitForClick);
          onClick();
        })
        .catch(errorInfo => {
          api.removePendingPromise(waitForClick);
          if (!errorInfo.isCanceled) {
            throw errorInfo.error;
          }
        });
    };
  
    const handleDoubleClick = () => {
      api.clearPendingPromises();
      onDoubleClick();
    };
  
    return [handleClick, handleDoubleClick];
};
// END PREVENT DOUBLECLICK REGISTERING 2 CLICK EVENTS





const CardComponent = React.memo(({
    inputCard,
    cardIndex,
    stackIndex,
    groupID,
    group,
    broadcast,
}) => {
    //const [card, setCard] = useState(inputCard);

    // I know that forceUpdate is a sign I'm doing something wrong. But without it I will
    // occasionally have cards refuse to rerender ater calling a broadcast. For some reason
    // the shouldComponentUpdate aleady sees the next state and thinks its the same as the
    // current one, so it doesn't update.
    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);

    const setActiveCard = useSetActiveCard();
    const [isActive, setIsActive] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    //const groups = gameUIView.game_ui.game.groups;
    //const cardWatch = groups[group.id].stacks[stackIndex]?.cards[cardIndex];

    //if (groupID==='gSharedStaging') console.log('rendering CardComponent');
    //if (groupID==='gSharedStaging') console.log(inputCard);

    // useEffect(() => {    
    //   if (inputCard) setCard(inputCard);
    // }, [inputCard]);
    //console.log('rendering',group.id,stackIndex,cardIndex, "comp");

    const handleMouseOver = (event) => {
        if (!isActive) {
            setIsActive(true);
            setActiveCard({card: inputCard, groupID: groupID, stackIndex: stackIndex, cardIndex: cardIndex});
            console.log('CardView activeCard',inputCard)
        }
    }

    const handleMouseLeave = (event) => {
        if (isActive) {
            setIsActive(false);
            setActiveCard(null);
        }
    }

    const onClick = (event) => {
        console.log(inputCard);
        return;
    }


    const onDoubleClick = (event) => {
        //forceUpdate();
        if (!inputCard.exhausted) {
            inputCard.exhausted = true;
            inputCard.rotation = 90;
        } else {
            inputCard.exhausted = false;
            inputCard.rotation = 0;
        }
        //setCard({...card});
        //const newGroup = group;
        //group.stacks[stackIndex].cards[cardIndex] = card;
        //setGroup({...group});
        //console.log(gameUIView.game_ui.game.groups);
        //console.log(group.id);
        //console.log(stackIndex);
        //console.log(groups[group.id].stacks[stackIndex]);
        //groups[group.id].stacks[stackIndex].cards[cardIndex] = card;
        broadcast("update_card",{card: inputCard, group_id: groupID, stack_index: stackIndex, card_index:cardIndex, temp:"ondoubleclick"});
        forceUpdate();
    }

    const [handleClick, handleDoubleClick] = useClickPreventionOnDoubleClick(onClick, onDoubleClick);


    const menuID = inputCard.id+'-menu';
    const zIndex = 1e5-cardIndex;
    //console.log(card.id);
    //console.log('in');
    //console.log(group);
    function handleMenuClick(e, data) {
        if (data.action === "detach") broadcast("detach", {group_id: groupID, stack_index: stackIndex, card_index: cardIndex})
    }
    if (!inputCard) return <div></div>;
    return (
        <div>
            <ContextMenuTrigger id={inputCard.id}> 
            <div 
                className={isActive ? 'isActive' : ''}
                key={inputCard.id}
                style={{
                    position: "absolute",
                    background: group.type === "deck" ? `url(${getCardBackSRC(inputCard)}) no-repeat` : `url(${inputCard.src}) no-repeat`,
                    backgroundSize: "contain",
                    height: `${CARDSCALE*inputCard.height}vw`,
                    width: `${CARDSCALE*inputCard.width}vw`,
                    left: `${0.2 + (1.39-inputCard.width)*CARDSCALE/2 + CARDSCALE/3*cardIndex}vw`,
                    top: `${0.2 + (1.39-inputCard.height)*CARDSCALE/2}vw`,
                    borderWidth: '1px',
                    borderRadius: '6px',
                    borderColor: isActive || isClicked ? 'yellow' : 'transparent',
                    //transform: `rotate(${angles}deg)`,
                    transform: `rotate(${inputCard.rotation}deg)`,
                    zIndex: zIndex,
                    cursor: "default",
                    WebkitTransitionDuration: "0.1s",
                    MozTransitionDuration: "0.1s",
                    OTransitionDuration: "0.1s",
                    transitionDuration: "0.1s",
                    WebkitTransitionProperty: "-webkit-transform",
                    MozTransitionProperty: "-moz-transform",
                    OTransitionProperty: "-o-transform",
                    transitionProperty: "transform",
                    // WebkitBoxShadow: "10px 10px 29px 5px rgba(0,0,0,0.26)",
                    // MozBoxShadow: "10px 10px 29px 5px rgba(0,0,0,0.26)",
                    // boxShadow: "10px 10px 29px 5px rgba(0,0,0,0.26)",
                }}
                onClick={handleClick}
                onDoubleClick={handleDoubleClick}
                onMouseOver={event => handleMouseOver(event)}
                onMouseLeave={event => handleMouseLeave(event)}
            >
                
                <TokensView card={inputCard} isHighlighted={isActive || isClicked} broadcast={broadcast} groupID={groupID} stackIndex={stackIndex} cardIndex={cardIndex}></TokensView>
            </div>
            </ContextMenuTrigger>

            <ContextMenu id={inputCard.id} style={{zIndex:1e6}}>
            {/* {stack.cards.map((card, cardIndex) => ( */}
                <hr></hr>
                {cardIndex>0 ? <MenuItem onClick={handleMenuClick} data={{ action: 'detach', groupID: groupID, stackIndex: stackIndex, cardIndex: cardIndex }}>Detach</MenuItem>:null}
                <MenuItem onClick={handleMenuClick} data={{ item: 'item 2' }}>Menu Item 2</MenuItem>
                <SubMenu title='A SubMenu'>
                    <MenuItem onClick={handleMenuClick} data={{ item: 'subitem 1' }}>SubItem 1</MenuItem>
                    <SubMenu title='Another SubMenu'>
                        <MenuItem onClick={handleMenuClick} data={{ item: 'subsubitem 1' }}>SubSubItem 1</MenuItem>
                        <MenuItem onClick={handleMenuClick} data={{ item: 'subsubitem 2' }}>SubSubItem 2</MenuItem>
                    </SubMenu>
                    <SubMenu title='Yet Another SubMenu'>
                        <MenuItem onClick={handleMenuClick} data={{ item: 'subsubitem 3' }}>SubSubItem 3</MenuItem>
                        <MenuItem onClick={handleMenuClick} data={{ item: 'subsubitem 4' }}>SubSubItem 4</MenuItem>
                    </SubMenu>
                    <MenuItem onClick={handleMenuClick} data={{ item: 'subitem 2' }}>SubItem 2</MenuItem>
                </SubMenu>
            </ContextMenu>
        </div>
    )
})

class CardClass extends Component {

    shouldComponentUpdate = (nextProps, nextState) => {
        
        if ( 
            (JSON.stringify(nextProps.inputCard)!==JSON.stringify(this.props.inputCard)) ||
            (nextProps.groupID!==this.props.groupID) ||
            (nextProps.stackIndex!==this.props.stackIndex) ||
            (nextProps.cardIndex!==this.props.cardIndex)
        ) {
            return true;
        } else {
            //console.log('DO UPDATE!!!!!');
            //console.log(this.props);
            //console.log(nextProps);
            return false; 
        }
    };
  
    render() {
        //if (this.props.groupID==='gSharedStaging') console.log('rendering Cardclass');
        //if (this.props.groupID==='gSharedStaging') console.log(this.props.inputCard);
        const inputCard = this.props.inputCard;
        const cardIndex = this.props.cardIndex;
        const stackIndex = this.props.stackIndex;
        const groupID = this.props.groupID;
        const broadcast = this.props.broadcast;
        return(
            <CardComponent
                inputCard={inputCard}
                cardIndex={cardIndex}
                stackIndex={stackIndex}
                groupID={groupID}
                group={this.props.group}
                broadcast={broadcast}
            ></CardComponent>
        )
    }
}


const CardView = React.memo(({
    inputCard,
    cardIndex,
    stackIndex,
    groupID,
    broadcast,
    group,
  }) => {
    //if (groupID==='gSharedStaging') console.log('rendering Cardview');
    console.log('rendering',group.id,stackIndex,cardIndex, "view");


    return (

        <CardClass
            inputCard={inputCard}
            cardIndex={cardIndex}
            stackIndex={stackIndex}
            groupID={groupID}
            group={group}
            broadcast={broadcast}
        ></CardClass>



    )
});

export default CardView;



