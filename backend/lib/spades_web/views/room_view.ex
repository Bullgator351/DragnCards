defmodule SpadesWeb.RoomView do
  use SpadesWeb, :view
  alias SpadesWeb.RoomView

  def render("index.json", %{rooms: rooms}) do
    %{data: render_many(rooms, RoomView, "room.json")}
  end

  def render("show.json", %{room: room}) do
    %{data: render_one(room, RoomView, "room.json")}
  end

  def render("room.json", %{room: room}) do
    %{
      id: room.id,
      name: room.name,
      slug: room.slug,
      player1: room.player1,
      player2: room.player2,
      player3: room.player3,
      player4: room.player4
    }
  end
end
