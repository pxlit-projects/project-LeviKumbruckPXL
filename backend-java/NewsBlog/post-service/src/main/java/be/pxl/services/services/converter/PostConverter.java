package be.pxl.services.services.converter;

import be.pxl.services.api.dto.PostDto;
import be.pxl.services.domain.Post;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class PostConverter implements Converter<Post, PostDto> {


    @Override
    public PostDto convert(Post post) {
        return new PostDto(
                post.getTitle(),
                post.getContent(),
                post.getRedactor(),
                post.isPublished()
        );

    }
}
