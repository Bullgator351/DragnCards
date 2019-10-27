import React, { useState, useCallback } from "react";
import CreateRoomModal from "./CreateRoomModal";
import LobbyTable from "./LobbyTable";
import Button from "../../components/basic/Button";
import Container from "../../components/basic/Container";

import useDataApi from "../../hooks/useDataApi";
import useChannel from "../../hooks/useChannel";

interface Props {}

export const Lobby: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const { isLoading, isError, data, setData } = useDataApi(
    "/be/api/rooms",
    null
  );

  const onChannelMessage = useCallback(
    (event, payload) => {
      console.log("Got channel message", event, payload);
      if (event === "rooms_update" && payload.rooms != null) {
        setData({ data: payload.rooms });
      }
    },
    [setData]
  );

  const broadcast = useChannel("lobby:lobby", onChannelMessage);
  const rooms = data != null && data.data != null ? data.data : [];

  return (
    <Container>
      <div>
        <h1 className="mb-4">Lobby</h1>
        {isLoading && <div>Loading..</div>}
        {isError && <div>Error..</div>}
        <LobbyTable rooms={rooms} />
        <div className="mt-4">
          <Button isPrimary onClick={() => setShowModal(true)}>
            Create Room
          </Button>
          <Button
            className="ml-4"
            onClick={() =>
              broadcast("test_message_from_javascript", { stuff: 1 })
            }
          >
            Broadcast
          </Button>
        </div>
        <CreateRoomModal
          isOpen={showModal}
          closeModal={() => setShowModal(false)}
        />
      </div>
    </Container>
  );
};
export default Lobby;