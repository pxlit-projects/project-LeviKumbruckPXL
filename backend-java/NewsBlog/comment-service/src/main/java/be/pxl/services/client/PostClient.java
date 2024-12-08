package be.pxl.services.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

@FeignClient(name = "post-service")
public interface PostClient {

    @PostMapping("/addComment/{postId}/{commentId}")
    void addComment(@PathVariable Long postId, @PathVariable Long commentId);
}