package be.pxl.services.services;

import be.pxl.services.api.dto.PostRequest;
import be.pxl.services.api.dto.PostResponse;
import java.time.LocalDate;
import java.util.List;

public interface IPostService {

    List<PostResponse> getAllPosts();

    PostResponse addPost(PostRequest postRequest);

    PostResponse saveAsDraft(PostRequest postRequest);

    List<PostResponse> getDraftsByRedactor(String redactor);

    PostResponse sendDraftForReview(Long id);

    List<PostResponse> filterPosts(String content, String redactor, LocalDate createdDate);

    PostResponse updatePost(Long id, PostRequest postRequest);

    List<PostResponse> getNeedsChangingPosts(String redactor);
}