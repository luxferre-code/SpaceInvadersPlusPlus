import type { Socket } from "socket.io-client";

export default class LobbyPage {
    private static readonly lobbyPage = document.querySelector("#lobby-page") as HTMLElement;
    private static readonly containerPlayers = this.lobbyPage.querySelector(".container-players-in-lobby") as HTMLElement;
    private static readonly containerPlayersList = this.containerPlayers.querySelector("ul") as HTMLUListElement;
    private static readonly noteAwaitingForManager = this.containerPlayers.querySelector("p:first-of-type") as HTMLParagraphElement;
    private static readonly noteForAwaitingPlayers = this.containerPlayers.querySelector("p:last-of-type") as HTMLParagraphElement;
    private static readonly hostUsername = this.noteAwaitingForManager.querySelector("span") as HTMLSpanElement;
    private static readonly hostButton = this.lobbyPage.querySelector("#host-game-button") as HTMLButtonElement;
    private static readonly quitRoomButton = this.lobbyPage.querySelector("#quit-lobby-button") as HTMLButtonElement;
    private static readonly lobbiesTable = this.lobbyPage.querySelector("table tbody") as HTMLTableSectionElement;

    private static init = false;
    private static socket: Socket | undefined = undefined;
    private static hosted_room_id: string | undefined = undefined;
    private static joined_room_id: string | undefined = undefined;
    private static game_started = false;

    private static game_started_callback: ((gameData: GameData) => void) | undefined = undefined;

    private static isHostingGame(): boolean {
        return this.hosted_room_id != undefined;
    }

    private static isClient(): boolean {
        return this.joined_room_id != undefined;
    }

    private static isConnected(): boolean {
        return this.isClient() || this.isHostingGame();
    }

    private static getRoomId(): string | undefined {
        return this.isClient() ? this.joined_room_id : this.hosted_room_id;
    }

    public static setOnGameStarted(callback: (gameData: GameData) => void): void {
        this.game_started_callback = callback;
    }

    public static bindEvents(socket: Socket) {
        if (!this.init) {
            this.socket = socket;

            this.hostButton.addEventListener("click", () => {
                if (!this.isHostingGame()) {
                    socket.emit("host", (room_id: string) => {
                        this.hostButton.textContent = "Lancer la partie";
                        this.hosted_room_id = room_id;
                        this.containerPlayers.setAttribute("aria-hidden", "false");
                        this.lobbiesTable.setAttribute("aria-hidden", "true");
                        this.noteForAwaitingPlayers.setAttribute("aria-hidden", "false");
                    });
                } else {
                    socket.emit("start_game", this.getRoomId(), (gameData: GameData) => {
                        this.game_started = true;
                        this.game_started_callback?.(gameData);
                    });
                }
            });

            this.quitRoomButton.addEventListener("click", () => {
                if (this.isConnected()) {
                    socket.emit("quit_room", this.getRoomId()!, () => {
                        this.joined_room_id = undefined;
                        this.hosted_room_id = undefined;
                    });
                }
            });

            socket.on("update_lobby", (rooms: Room[]) => {
                if (this.isConnected()) {
                    if (this.game_started) {
                        console.log("game is started, ignore lobby update");
                    } else {
                        const room_id = this.getRoomId();
                        const all_players = rooms.find(r => r.id === room_id)?.players;
                        if (all_players != undefined) {
                            const other_players = all_players.filter(p => p.id !== socket.id);
                            if (all_players.length > 0) {
                                const manager = all_players[0];
                                this.noteAwaitingForManager.setAttribute("aria-hidden", manager.id === socket.id ? "true" : "false");
                                this.hostUsername.textContent = manager.username;
                            }
                            this.updateAwaitingPlayers(other_players.map(p => p.username));
                        }
                    }
                } else {
                    this.resetView();
                    this.updateRooms(rooms);
                }
            });

            socket.on("host_started_game", (gameData: GameData) => {
                // The host started the game, so the server
                // sends the information to all listeners of his room.
                if (this.isClient()) {
                    this.game_started_callback?.(gameData);
                }
            });

            this.init = true;
        }
    }

    /**
     * A player is trying to join a room.
     */
    private static onPlayerAskingToJoin(room_id: string): void {
        if (this.socket) {
            this.socket.emit("join_room", room_id, (success: boolean) => {
                if (success) {
                    this.joined_room_id = room_id;
                    this.hostButton.setAttribute("aria-hidden", "true");
                    this.containerPlayers.setAttribute("aria-hidden", "false");
                    this.lobbiesTable.setAttribute("aria-hidden", "true");
                    this.noteForAwaitingPlayers.setAttribute("aria-hidden", "false");
                    this.noteAwaitingForManager.setAttribute("aria-hidden", "false");
                } else {
                    alert("Action impossible.");
                }
            });
        }
    }

    /**
     * Creates a row to be displayed in {@link lobbiesTable}.
     */
    private static createRoomElement(room: Room): HTMLTableRowElement {
        const tr = document.createElement("tr");
        const tdName = document.createElement("td");
        const tdBtn = document.createElement("td");
        const btn = document.createElement("button");
        const icon = document.createElement("i");
        icon.className = "fa-solid fa-play";
        btn.appendChild(icon);
        btn.append("Rejoindre");
        btn.addEventListener("click", () => {
            this.onPlayerAskingToJoin(room.id);
        });
        tdBtn.appendChild(btn);
        tdName.append(`${room.id} : ${room.players.length} joueur${room.players.length > 1 ? 's' : ''}`);
        tr.appendChild(tdName);
        tr.appendChild(tdBtn);
        return tr;
    }

    private static createAwaitingPlayerElement(player: string): HTMLElement {
        const li = document.createElement("li");
        li.append(player);
        return li;
    }

    /**
     * Clears the rooms that are currently being displayed in {@link lobbiesTable}.
     */
    private static clearView(element: HTMLElement): void {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    /**
     * Creates the rows of {@link lobbiesTable} so that the player can join them.
     */
    private static updateRooms(rooms: Room[]): void {
        this.clearView(this.lobbiesTable);
        for (const room of rooms) {
            this.lobbiesTable.appendChild(this.createRoomElement(room));
        }
    }

    private static updateAwaitingPlayers(players: string[]): void {
        this.clearView(this.containerPlayersList);
        for (const player of players) {
            this.containerPlayersList.appendChild(this.createAwaitingPlayerElement(player));
        }
    }

    private static resetView(): void {
        this.hostButton.textContent = "Host une game";
        this.hostButton.setAttribute("aria-hidden", "false");
        this.hosted_room_id = undefined;
        this.joined_room_id = undefined;
        this.containerPlayers.setAttribute("aria-hidden", "true");
        this.lobbiesTable.setAttribute("aria-hidden", "false");
        this.noteForAwaitingPlayers.setAttribute("aria-hidden", "true");
    }

    public static requestRooms() {
        if (this.socket) {
            this.socket.emit("request_lobby", (rooms: Room[]) => {
                this.updateRooms(rooms);
            });
        }
    }
}
