package be.pxl.services.services.converter;

import be.pxl.services.api.dto.CommentDto;
import be.pxl.services.domain.Comment;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class CommentConverter implements Converter<Comment, CommentDto> {


    @Override
    public CommentDto convert(Comment comment) {
        return new CommentDto(
                comment.getTitle(),
                comment.getContent(),
                comment.getRedactor(),
                comment.isPublished()
        );

    }
}
