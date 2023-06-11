import {
  Avatar,
  Box,
  Button,
  CardContent,
  Collapse,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import { useState } from "react";
import { axiosUrl } from "../../../../axios/axiosInstance";
import { socketServer } from "../../../../socketIo/SocketIo";
import { format } from "timeago.js";
import "./style.css";
import { logger } from "workbox-core/_private";

const Comment = ({ openComment, setOpenComment, post, setFeed }) => {
  const userData = JSON.parse(localStorage.getItem("userData"));
  const userId = userData?.user.id;

  const userName = userData?.user.name;

  const profileImage = userData?.user.profileImage;

  const comments = post.comments.reverse();
  const timeStamp = new Date();
  const hours = timeStamp.getHours() % 12 || 12;
  const date =
    hours + ":" + timeStamp.getMinutes() + ", " + timeStamp.toDateString();
  const socket = socketServer;

  const postedUserId = post.userId._id;

  const [comment, setComment] = useState("");

  const [commentData, setCommntData] = useState(false);

  const [result, setResult] = useState(null);
  const [like, setLike] = useState(0);
  const [rplyComment, setRplyComment] = useState(false);
  const [replay, setReplay] = useState([]);
  const [replayComment, setReplayComment] = useState("");

  console.log(replay);

  const toogleComment = () => {
    setRplyComment(!rplyComment);
  };

  const submit = () => {
    if (comment === "") {
      setCommntData(true);
    } else {
      socket.emit("sendNotification", {
        receverId: postedUserId,
      });

      axiosUrl
        .put("/addComment", {
          comment,
          userId,
          date,
          timeStamp,
          postId: post._id,
          userName,
          profileImage,
          postedUserId,
        })
        .then((result) => {
          if (result.data.commentAdded) {
            setFeed(Math.random());
            setOpenComment(true);
            setCommntData(false);
            setResult(result.data);
            setComment("");
          }
        })
        .catch((err) => {
          alert(err.message);
        });
    }
  };

  console.log(Date.now());

  useEffect(() => {
    return () => {};
  }, [result]);

  return (
    <Box>
      <Box m component={"div"}>
        <Collapse
          className={"collapse"}
          in={openComment}
          sx={{ maxHeight: "300px", overflowY: "scroll" }}
          timeout="auto"
          unmountOnExit
        >
          <CardContent>
            <Box component={"div"}>
              <Box postion={"fixed"}>
                <Box>
                  <Box pb>Comments</Box>
                  <Divider width={70} />
                </Box>
                <Box display={"flex"} mt>
                  <TextField
                    className={"collapse"}
                    style={{ overflow: "hidden" }}
                    fullWidth
                    id="standard-basic"
                    variant="outlined"
                    placeholder="Add your comment..."
                    multiline
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    helperText={commentData ? "Plese add a comment" : ""}
                    rows={1}
                  />
                  <Box pt={3}>
                    <Button onClick={submit}>Post</Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          </CardContent>
          {comments.map((comment) => {
            return (
              <Box key={comment.timeStamp}>
                <Box display={"flex"}>
                  <Avatar
                    src={`/images/profileImages/${comment.commentedUserImage}`}
                    alt={post.userId.firstName}
                    sx={{
                      margin: 1.5,
                      width: { xs: "2rem" },
                      height: { xs: "2rem" },
                      cursor: "pointer",
                    }}
                    aria-label="recipe"
                  ></Avatar>
                  <Box component={"div"} marginTop={2}>
                    <Box display="flex" alignItems={"center"}>
                      <Typography sx={{ fontSize: 13, fontWeight: "bold" }}>
                        {comment.commentedUserName ?? "You"}
                      </Typography>
                      <Box sx={{ marginLeft: 2, fontSize: 10 }}>
                        {" "}
                        {format(1686472728039)}
                      </Box>
                    </Box>
                    <Box marginLeft={1} marginTop={1}>
                      <Typography
                        sx={{
                          fontSize: 11,
                          wordWrap: "break-word",
                          maxWidth: { xs: 200, md: 400 },
                          minWidth: { xs: 200, md: 350 },
                        }}
                      >
                        {comment?.comment}
                      </Typography>

                      {replay?.map((rply) => {
                        return (
                          <Box
                            fontSize={10}
                            marginLeft={"5px"}
                            sx={{
                              border: "1px solid #000",
                              borderColor: "black",
                              width: 50,
                              padding: "3px",
                              backgroundColor: "#E0E0E0",
                              borderRadius: "5px",
                              marginTop: "3px",
                            }}
                          >
                            {rply}
                          </Box>
                        );
                      })}

                      <Box display="flex" marginTop={1}>
                        <Box
                          fontSize={10}
                          fontWeight="bold"
                          sx={{ cursor: "pointer" }}
                          onClick={() => setLike(like + 1)}
                        >
                          Like <span>{like}</span>
                        </Box>
                        <Box
                          marginLeft={3}
                          fontWeight={"bold"}
                          fontSize={10}
                          sx={{ cursor: "pointer" }}
                        >
                          <span onClick={toogleComment}>Replay</span>
                          {rplyComment ? (
                            <Box
                              marginTop={"5px"}
                              display="flex"
                              marginLeft="5px"
                            >
                              <input
                                type="text"
                                onChange={(e) =>
                                  setReplayComment(e.target.value)
                                }
                              />
                              <button
                                onClick={() => {
                                  setReplay((current) => [
                                    ...current,
                                    replayComment,
                                  ]);
                                  setRplyComment(false);
                                }}
                              >
                                Add
                              </button>
                            </Box>
                          ) : (
                            ""
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Collapse>
      </Box>
    </Box>
  );
};

export default Comment;
